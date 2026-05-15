# Build Spec: Reverse Tutor (v1.3 — patch to working v1.2 implementation)

> **Patch document.** Assumes the v1.2 architecture is in place (Claude Code's current build): three-role split (Student / Grader / Judge), OpenRouter with model fallback chains, `callJSONValidated` with `z.preprocess`, deterministic Orchestrator with per-misconception state machine, pre-teach flow, end-of-session synthesis with AI-literacy stats, hint button, Sam state panel.
> 
> This document covers fixes and refinements based on observed logs and the role/model brief. Architectural baseline is unchanged.

---

## Critical bugs

### Fix 1: JSON key typos (concept_prider, etc.)

Pre-teach calls repeatedly produce `concept_prider` instead of `concept_primer`. The model has settled on this token sequence; retries with stricter prompts don't fix it and eventually crash with a Zod error.

Add Levenshtein-distance key normalization inside `callJSONValidated`, before `schema.parse(parsed)`:

```typescript
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    [i, ...Array(n).fill(0)]
  );
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function normalizeKeys(obj: unknown, expectedKeys: string[]): unknown {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (expectedKeys.includes(key)) {
      result[key] = value;
      continue;
    }
    const match = expectedKeys
      .map(e => ({ key: e, dist: levenshtein(key, e) }))
      .filter(x => x.dist > 0 && x.dist <= 2)
      .sort((a, b) => a.dist - b.dist)[0];
    if (match && !(match.key in result)) {
      result[match.key] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

// In callJSONValidated, just before schema.parse(parsed):
const expected = Object.keys((schema as any).shape || {});
parsed = normalizeKeys(parsed, expected);
```

Catches typos with edit distance ≤ 2 without prompt changes. Idempotent — won't clobber correctly-spelled keys.

---

## Role configuration

### Fix 2: Per-function reasoning effort

Current setup: Student has full thinking, Grader has `effort: 'low'`, Judge (Coach / Synthesis / Preteach / Audit) all share `effort: 'none'`. This starves Coach and Synthesis — the two functions that actually need to reason — while over-allocating compute to roles that don't.

**Updated allocation:**

| Function | Effort | Reasoning |
|---|---|---|
| Student | full thinking | Persona maintenance is reasoning-heavy |
| Grader | `'low'` → `'medium'` | See Fix 6 below — calibration scoring needs more |
| Coach | `'medium'` | Identifying what's missing in user's teaching is non-trivial |
| Synthesis | `'medium'` | Reading full transcript, picking moments, AI-literacy analysis |
| Preteach | `'low'` | Templated generation |
| Audit | `'none'` | Pattern matching |

**Implementation:** either split into `COACH_MODEL`, `SYNTH_MODEL`, `PRETEACH_MODEL`, `AUDIT_MODEL` env vars (most flexible), or keep `JUDGE_MODEL` and pass `reasoning_effort` override per call. Recommendation: per-call override, since the model can stay the same and only effort changes.

```typescript
// In lib/openrouter.ts callOpenRouter signature
type CallOptions = {
  model: string;
  messages: ChatMessage[];
  jsonMode?: boolean;
  temperature?: number;
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high';  // NEW
  stream?: boolean;
};

// In request body:
body: JSON.stringify({
  model,
  messages,
  temperature,
  ...(reasoningEffort ? { reasoning: { effort: reasoningEffort } } : {}),
  ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  ...(stream ? { stream: true } : {}),
})
```

Then at each call site pick the right effort:

```typescript
// Coach call
await callJSONValidated({ model: JUDGE_MODEL, reasoningEffort: 'medium', ... }, CoachResultSchema);

// Synthesis call
await callJSONValidated({ model: JUDGE_MODEL, reasoningEffort: 'medium', ... }, SynthResultSchema);

// Preteach call
await callJSONValidated({ model: JUDGE_MODEL, reasoningEffort: 'low', ... }, PreteachResultSchema);

// Audit call (if enabled)
await callJSONValidated({ model: JUDGE_MODEL, reasoningEffort: 'none', ... }, AuditResultSchema);
```

---

## Orchestrator refinements

### Fix 3: Force transfer_check when a misconception hits `updating`

Currently `transfer_check` is just weighted in random selection. This makes `updating → settled` luck-dependent.

At the top of `pickIntent()`, before weighting logic:

```typescript
export function pickIntent(session: Session): TurnIntent {
  // Forced rule: if any misconception just transitioned to 'updating' on the
  // user's most recent turn, force transfer_check next.
  const lastTransitions = getLastTurnTransitions(session);  // see Fix 5
  const justUpdated = lastTransitions.find(t => t.to === 'updating');
  if (justUpdated) {
    return { type: 'transfer_check', misc_id: justUpdated.misc_id };
  }

  // ... rest of existing weighting logic
}
```

This makes the transfer-check moment deterministic — the user gets the test right after Sam claims to understand, which is the pedagogically correct beat.

### Fix 4: Soft pacing rules (weight modifiers, not hard zeros)

Current code sets `weights[lastIntent.type] = 0` to forbid consecutive same-type. Too rigid — Sam can legitimately need to defend twice when the user pushes back twice.

Replace hard zeros with multipliers:

```typescript
// Old:
weights[lastIntent.type] = 0;

// New:
weights[lastIntent.type] = (weights[lastIntent.type] ?? 0) * 0.3;
```

Same for the "after 3 wrong in 5, force honest" rule — change from hard return to a heavy bias:

```typescript
if (wrongInLast5 >= 3) {
  weights.honest_reason *= 3;
  weights.honest_question *= 3;
  weights.honest_partial *= 3;
  weights.express_misc *= 0.2;
  weights.probe_minor = 0;
  weights.probe_trap = 0;
  // ... continue to weighted selection rather than returning early
}
```

### Fix 5: Softmax-style sampling (top-k or temperature)

The current weighted random produces arbitrary-feeling picks (e.g., probe_trap fired at weight 4 against express_misc at weight 35 — a 5% draw that landed). Either:

**Option A — top-k filter (simpler):**
```typescript
function weightedRandom(weights: Record<string, number>): string {
  const max = Math.max(...Object.values(weights));
  const threshold = max * 0.15;
  const filtered = Object.fromEntries(
    Object.entries(weights).filter(([, w]) => w >= threshold)
  );
  return drawFromWeights(filtered);
}
```

**Option B — softmax with temperature (smoother):**
```typescript
function softmaxSample(weights: Record<string, number>, temp = 0.5): string {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const max = Math.max(...entries.map(([, w]) => w));
  const exps = entries.map(([k, w]) => [k, Math.exp((w - max) / (max * temp))] as const);
  const total = exps.reduce((s, [, e]) => s + e, 0);
  let r = Math.random() * total;
  for (const [k, e] of exps) {
    r -= e;
    if (r <= 0) return k;
  }
  return exps[exps.length - 1][0];
}
```

Pick A for predictability, B for smoothness. Either makes intent picks feel less arbitrary than naked weighted random.

---

## Coach refinements

### Fix 6: Add reasoning-quality trigger

Coach currently fires on: (a) 3 turns stuck on same misconception, (b) hint request, (c) `updating → settled` checkpoint. Add a fourth: reasoning quality is dropping.

```typescript
function shouldFireReasoningCoach(session: Session): boolean {
  const recent = session.scores.slice(-3);
  if (recent.length < 3) return false;
  const reasoning = recent.map(s => s.scores.reasoning);
  const allWeak = reasoning.every(r => r <= 2);
  const declining = reasoning[0] > reasoning[2] && reasoning[2] <= 2.5;
  // Don't pile coach nudges
  const lastCoachTurn = session.lastCoachTurnIndex ?? -10;
  const cooldownOk = session.turns.length - lastCoachTurn >= 3;
  return cooldownOk && (allWeak || declining);
}
```

### Fix 7: Layered Coach intervention

Given multi-minute Student calls on free tier, 3 turns of stuck = 10+ min of user frustration. Two intervention levels:

```typescript
type CoachTrigger = 'soft_nudge' | 'stuck' | 'reasoning_weak' | 'hint_request' | 'transfer_check';

function decideCoachTrigger(session: Session): CoachTrigger | null {
  if (userJustRequested(session)) return 'hint_request';
  if (justHitUpdating(session)) return 'transfer_check';
  if (stuckTurns(session) >= 3) return 'stuck';
  if (shouldFireReasoningCoach(session)) return 'reasoning_weak';
  // Soft nudge: 1 turn at same state + reasoning ≤ 2.5
  if (stuckTurns(session) >= 1 && lastReasoningScore(session) <= 2.5) return 'soft_nudge';
  return null;
}
```

### Fix 8: Coach prompt — trigger-aware tone

The Coach prompt needs to behave differently based on trigger. Update the prompt to accept `trigger` and instruct accordingly:

```
You are a Coach giving the learner a nudge. Tone and intensity depend on the trigger.

Trigger: {trigger}

Trigger-specific guidance:
- soft_nudge: light, optional, questioning. "Curious — have you tried having Sam predict first?" Don't be directive.
- stuck: directive strategy. "Sam keeps coming back to X because you haven't addressed Y. Try a thought experiment with Z."
- reasoning_weak: metacognitive. Surface what their teaching is missing, don't give the answer. "You're explaining the conclusion but not the why" / "try slowing down and breaking it into smaller pieces."
- hint_request: directive but slightly less than 'stuck' (they asked, so they're engaged). Suggest a specific next move.
- transfer_check: pose a transfer question for them to use. "Sam said they get it — try giving them a different case to test it."

NEVER give the answer. Always nudge a strategy or a question to try.

Current misc states: {miscStates}
Last 4 turns: {turns}
User's committed strategy: {strategyChoices}
Trigger reason detail: {trigger_detail}

Respond with ONLY JSON: { "nudge": "<2-3 sentences>", "trigger": "...", "intensity": "soft|firm|directive" }
```

### Fix 9: Coach UI — match intensity visually

`soft_nudge` should render as a faint subtle suggestion in the side panel (small text, no card). `stuck` and `hint_request` render as the existing card. `reasoning_weak` somewhere in between. This stops the "everything is a giant yellow card" feel and signals the system is calibrating its interventions.

---

## Grader refinements

### Fix 10: Multiple state transitions per turn

A single good teaching move can address multiple misconceptions. Change Grader output schema from `state_transition: {...} | null` to `state_transitions: [...]` (array, possibly empty):

```typescript
export const GradeResultSchema = z.object({
  scores: z.object({
    framing: z.number().min(1).max(5),
    questions: z.number().min(1).max(5),
    reasoning: z.number().min(1).max(5),
    uncertainty: z.number().min(1).max(5),
    calibration: z.number().min(1).max(5),
  }),
  emoticon: z.enum(['delighted', 'happy', 'neutral', 'concerned', 'sad']),
  tag: z.string().max(40),
  evidence: z.string().max(200),
  state_transitions: z.array(z.object({  // CHANGED from single → array
    misc_id: z.string(),
    from: z.enum(['entrenched','aware','considering','updating','settled']),
    to: z.enum(['entrenched','aware','considering','updating','settled']),
    reason: z.string(),
  })).default([]),
});
```

Update the Grader prompt:

> Emit 0, 1, or more state transitions if the user's move clearly affects multiple misconceptions. Be conservative — if a transition is uncertain, don't emit it. Common cases for multiple transitions: a thought experiment that addresses both `heavier-faster` and `force-equals-acceleration` at once.

In the chat route, apply all transitions in `state_transitions` to `session.miscStates`.

### Fix 11: Calibration scoring diagnostic

Spot-check: in current logs, calibration hovers at 3-4 while other dimensions vary 2-3. Possible causes:
1. Grader is scoring calibration as a function of other dimensions (e.g., high reasoning ≈ high calibration). Bad — collapses the signal.
2. Grader is conservatively defaulting to 3-4 when uncertain. Acceptable but uninformative.

**Diagnostic:** add a logging hook that records per-turn:
- `calibration` score
- intent of previous Sam turn
- Expected calibration range for that intent (probe_trap caught → ≥4; probe_trap missed → ≤2; honest_reason accepted → ≥3; honest_reason challenged → ≤2)

After a few sessions, see if calibration scores match the expected ranges. If they don't, the Grader isn't really evaluating calibration. Fix candidates:
- Bump Grader effort to `'medium'` (Fix 2)
- Make the calibration scoring rules in the prompt more explicit (with concrete examples per intent type)
- Consider splitting calibration into its own Grader call

---

## State machine refinements

### Fix 12: Regression as a visible event

Pedagogically, regressions are the *most important moments* — the user discovered Sam didn't really get it. Currently they happen silently.

Whenever `state_transitions` includes a regression (state index decreases), emit a `regression_event` in the chat response:

```typescript
const regressions = state_transitions.filter(t => stateIndex(t.to) < stateIndex(t.from));
const responseExtras = {
  ...
  regression_events: regressions.map(r => ({
    misc_id: r.misc_id,
    belief: brief.misconceptions.find(m => m.id === r.misc_id)?.belief,
    message: `Sam slipped back on this — they didn't actually have it yet.`,
    reason: r.reason,
  })),
};
```

UI: show a small callout in the chat scroll (not as a Coach card — this is a system event, not advice). Persists for the next 2 turns then fades.

### Fix 13: Optional — sub-state intensity (defer if cost is high)

Add `intensity: number` (0-1) per misconception state. Each turn-of-engagement nudges up by 0.2-0.3 (Grader emits intensity delta in addition to/instead of full transition). Transition fires at intensity ≥ 0.8.

Visual: state dot fills gradually rather than jumping. Makes progression feel continuous.

This is a fairly large change to the state model. Defer unless the hard-transition feel is genuinely a UX problem. Currently it seems acceptable.

---

## UX refinements

### Fix 14: Visible Student token streaming

Some Student calls in logs take 60-180 seconds. Without visible streaming, the chat appears to hang. Stream tokens via SSE:

```typescript
// In /api/chat route:
async function* streamStudent(...) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { ... },
    body: JSON.stringify({ ..., stream: true }),
  });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {}
    }
  }
}
```

Front-end: append chunks to the assistant message in real-time. Even a slow 90s response feels acceptable when the user can see tokens arriving.

### Fix 15: Hint button cooldown

To prevent the "spam Coach until I get a good hint" pattern visible in logs (3+ hint requests in some turn windows), add a 1-turn cooldown after hint use. Surface as a disabled button: "Hint available next turn."

---

## Observability

### Fix 16: Per-turn replay logging

Console logs go to stdout and are lost. Persist with each session turn for offline analysis. Add to the `Turn` type:

```typescript
export type Turn = {
  role: 'user' | 'student';
  content: string;
  timestamp: number;
  intent?: TurnIntent;
  mode?: SamMode;
  // NEW: orchestrator + grader trace for replay
  trace?: {
    orchestratorWeights?: Record<string, number>;
    orchestratorPicked?: string;
    graderRawResponse?: unknown;
    coachTrigger?: CoachTrigger;
    stateBeforeTurn?: Record<string, MisconceptionState>;
    stateAfterTurn?: Record<string, MisconceptionState>;
  };
};
```

Optionally expose a `/api/session/[id]/export` endpoint that dumps the full session as JSON for offline review. Invaluable when debugging why a session went off the rails.

---

## Process recommendation

### Calibration run (do this before the next iteration)

The pattern so far has been: run a session, find a bug, patch it. The system is now complex enough that single-session feedback over-fits. Before the next round of changes, do a 5-6 session sweep:

| User style | What it tests |
|---|---|
| Aggressive corrector | Does the Grader penalize over-correction on honest turns? |
| Under-corrector | Are probes/traps catching the user appropriately? |
| Only asks questions | Does reasoning stay scoreable? Does Coach fire? |
| Long detailed explanations | Does Sam update too easily on depth-4 misconceptions? |
| Short shallow pushes | Does Sam stay entrenched as expected? |
| Random / off-topic | How does the orchestrator handle no-topic-relevance turns? |

Export session traces (Fix 16) and look at patterns *across* sessions. Specifically:
- Coach fire rate per trigger type (is reasoning_weak ever firing?)
- Distribution of intents chosen (is the mix roughly the target 50-60% honest / 25-30% misc / 10-15% probe-trap?)
- Calibration score variance vs other dimensions (diagnostic from Fix 11)
- State transitions per session (avg, distribution)
- Coach hint follow-through (do users actually try the suggestion?)

Patterns across sessions reveal what's actually broken vs. what's a one-off.

---

## Explicitly NOT in this patch

- Re-enabling Audit (defer until other fixes land)
- Brief authoring UI (stretch)
- LLM-based Orchestrator (heuristic is working; revisit only if calibration run shows it's making bad picks)
- Multi-session memory of user's weaknesses (future)
- Voice/audio interface (out of scope)

---

## Suggested implementation order

1. **Fix 1** (JSON normalization) — 5 minutes, immediate stability win, unblocks Preteach reliability.
2. **Fix 2** (per-function reasoning effort) — small config change, biggest quality lift on Coach and Synthesis.
3. **Fix 16** (replay logging) — do this before the rest so you can measure impact.
4. **Fixes 3, 4, 5** (Orchestrator refinements) — forced transfer_check, soft pacing, softmax sampling.
5. **Fixes 6, 7, 8, 9** (Coach overhaul) — reasoning trigger, layered intervention, prompt update, UI matching.
6. **Fix 10** (Grader multi-transitions).
7. **Fix 12** (regression events in UI).
8. **Fix 14** (Student streaming) — UX win, especially given slow free-tier calls.
9. **Fix 15** (hint cooldown).
10. **Calibration run** — 5-6 sessions across user styles.
11. **Fix 11** (calibration diagnostic) — analyze the run.
12. **Fix 13** (sub-state intensity) — only if calibration run shows the hard-transition feel is hurting UX.

---

## Quick reference — what's still working from v1.2 and shouldn't change

- Three-role split (Student / Grader / Judge as distinct configs)
- Information isolation matrix (Grader does not get the brief)
- OpenRouter fallback chain with 429/404 handling
- Balanced-brace JSON extraction + `z.preprocess`
- Deterministic Orchestrator (do not promote to LLM call yet)
- Per-misconception state machine
- Mode cycling for Sam's voice
- Pre-teach flow (3 screens: primer, preview, strategy commit)
- Sam state panel (right column)
- AI-literacy callout in recap
- Hint button with grading penalty
- Auditor disabled by default

If any of these regress during the patch implementation, that's a bug — not the intended change.
