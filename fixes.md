# Build Spec: Reverse Tutor (v1.3.1 — post-calibration patch)

> **Focused patch.** Applies to a v1.2/v1.3 implementation. Derived from one real session of the sample physics brief where the Grader behaved correctly but the Student's voice did not track state changes, producing a felt-experience of "Sam never updates" despite the state machine advancing correctly.
> 
> Five fixes, ordered by impact. Fix 1 alone should noticeably shift the session feel.

---

## Context: what this patch is fixing

A session run on the sample physics brief produced these symptoms:

- State machine advanced correctly: `heavier-faster: entrenched → aware → considering → updating` over 4 turns
- Grader scored teaching moves accurately (tags like "socratic thought experiment", "probing analogy" with reasoned transitions)
- Multi-transitions per turn were firing (one turn advanced two misconceptions)
- **But Sam's responses kept sounding entrenched even when state was `updating`**
- Coach fired `stuck` immediately after two successful transitions (false positive)
- One Sam turn expressed a misconception that wasn't in the picked intent (honest_reason produced air-irrelevant talk)
- Session start did two `/api/preteach/init` calls in sequence (~90s of pre-chat latency)
- Sam response latencies ranged 48s to 4.6 minutes with no visible streaming

The fixes below target each of these specifically.

---

## Fix 1: State-aware behavioral guidance in intent prelude

**Problem:** The intent prelude currently names the misconception state ("you are currently aware on this belief") but doesn't tell the Student what `aware` means *behaviorally*. Free-tier models don't reliably infer the appropriate resistance level. Result: a misconception at `updating` produces output that still sounds `entrenched`.

**Fix:** Add explicit per-state behavior strings and inject them into the prelude for `express_misc` and `defend_misc` intents.

In `lib/prompts/intentPrelude.ts`:

```typescript
const STATE_BEHAVIOR: Record<MisconceptionState, string> = {
  entrenched: "State your belief flatly with confidence. The user hasn't given you reason to doubt it yet. Push back on corrections without acknowledging them.",
  aware: "Acknowledge the user's argument explicitly before pushing back. You haven't conceded the point, but you're listening. Use phrases like 'okay I see what you mean, but...' or 'that's a fair point, except...'.",
  considering: "Hedge clearly. Voice real doubt about your own position. Acceptable phrases: 'wait, maybe...', 'okay actually that part makes sense...', 'I'm getting confused about which part I believe'. You should NOT confidently restate the original belief.",
  updating: "Largely accept the new model in your own words. Articulate the corrected understanding. Only raise specific residual confusion about edge cases or implications. You MUST NOT restate the original misconception as if you still believe it.",
  settled: "Do not fire this intent — the Orchestrator should never reach this state for express_misc or defend_misc. If somehow received, ignore the intent and ask a curious follow-up question instead.",
};

export function buildIntentPrelude(
  intent: TurnIntent,
  mode: SamMode,
  brief: Brief,
  miscStates: Record<string, MisconceptionState>
): string {
  switch (intent.type) {
    // ... honest_* cases unchanged

    case 'express_misc':
    case 'defend_misc': {
      const m = brief.misconceptions.find(x => x.id === intent.misc_id)!;
      const state = miscStates[intent.misc_id];
      const action = intent.type === 'defend_misc'
        ? `The user attempted to correct your belief "${m.belief}". Respond.`
        : `You are voicing your belief "${m.belief}".`;
      return `For THIS turn: ${action}

CURRENT STATE on this belief: ${state}
${STATE_BEHAVIOR[state]}

Depth ${m.depth}/5 controls how much teaching across the session is needed to advance state. It does NOT control how to behave on THIS individual turn — current state above controls that.

Mode: ${mode}.`;
    }

    // ... other cases unchanged
  }
}
```

**Verification:** Run a session where you get `heavier-faster` to `updating`. Sam's next response on a `defend_misc[heavier-faster]` should clearly accept the new model and raise only residual confusion — not say "the car is way heavier so it should fall faster."

---

## Fix 2: Visible Student token streaming

**Problem:** Sam response times in the log: 89s, 48s, **4.6 min**, 3.0 min, 2.1 min, 55s. Without visible streaming the chat appears to hang. v1.3 Fix 14 specified this but it wasn't implemented.

**Fix:** Implement SSE streaming for the Student call in `/api/chat`. Other calls (Grader, Coach, Auditor) stay non-streaming since their JSON output isn't useful partial.

In `lib/openrouter.ts`, add a streaming variant:

```typescript
export async function* streamOpenRouter(opts: CallOptions): AsyncGenerator<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Reverse Tutor',
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      stream: true,
      ...(opts.reasoningEffort ? { reasoning: { effort: opts.reasoningEffort } } : {}),
    }),
  });
  if (!res.ok || !res.body) throw new Error(`OpenRouter stream ${res.status}`);
  const reader = res.body.getReader();
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

In `/api/chat/route.ts`, stream the Student response back to the client via SSE while collecting the full text for session persistence:

```typescript
const encoder = new TextEncoder();
const stream = new ReadableStream({
  async start(controller) {
    let fullText = '';
    for await (const chunk of streamOpenRouter({ model: STUDENT_MODEL, messages, ... })) {
      fullText += chunk;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`));
    }
    // Persist the full turn
    session.turns.push({ role: 'student', content: fullText, intent, mode, timestamp: Date.now() });
    // Send the final event with scores etc.
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', scores, emoticon, tag, state_transitions, coachNudge })}\n\n`));
    controller.close();
  },
});
return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
```

Front-end: append `chunk` events to the message bubble as they arrive. Apply `done` event to update state panel + emoticon.

**Verification:** A 4-minute response should now show tokens arriving from the first ~2 seconds. The user can read along instead of staring at a typing indicator.

---

## Fix 3: Stuck-detector bug

**Problem:** In the log, Coach fired `trigger: stuck` immediately after two successful state transitions in the prior turns. The detector is broken — likely not consulting the transitions array.

**Fix:** Replace `isStuck` (or equivalent) with this implementation:

```typescript
function isStuck(session: Session): boolean {
  const recentScores = session.scores.slice(-3);
  if (recentScores.length < 3) return false;

  // Count forward transitions in the window
  const forwardTransitions = recentScores
    .flatMap(s => s.state_transitions ?? [])
    .filter(t => stateIndex(t.to) > stateIndex(t.from));

  return forwardTransitions.length === 0;
}

const STATE_ORDER = ['entrenched', 'aware', 'considering', 'updating', 'settled'] as const;
function stateIndex(s: MisconceptionState): number {
  return STATE_ORDER.indexOf(s);
}
```

Additionally, check the Coach cooldown — even when truly stuck, Coach shouldn't fire more than once per 3 turns. Already specified in v1.3 Fix 6 but worth verifying:

```typescript
function canFireCoach(session: Session): boolean {
  const lastCoach = session.lastCoachTurnIndex ?? -10;
  return session.turns.length - lastCoach >= 3;
}
```

**Verification:** Reproduce the session — coach should NOT fire after two successful transitions.

---

## Fix 4: Off-intent enforcement

**Problem:** In the log, Orchestrator picked `honest_reason + asking_back` for Turn 13 but Sam expressed the `air-irrelevant` misconception ("air resistance is basically a non-issue for 99% of stuff"). The Student model deviated from the intent.

**Fix:** Add an explicit constraint to the Student persona prompt (`lib/prompts/student.ts`):

Add as rule 8 (after the existing rules):

```
8. INTENT DISCIPLINE: If your current turn instruction begins with "honest_" (honest_reason, honest_question, or honest_partial), you must NOT express, voice, or hedge any belief from your brief. Not in passing, not as an aside, not as a "wait what about..." pivot. Reason correctly on the immediate topic only. If you feel tempted to introduce a doubt or alternative case from your brief, suppress it — the Orchestrator will give you an `express_misc` or `defend_misc` turn when that's appropriate.
```

If Auditor is enabled (defaults off), add an explicit check in the auditor prompt:

```
EXTRA CHECK if current intent starts with "honest_":
- Did the draft express, voice, or hedge any belief from the brief's misconceptions list?
- If yes, reject with reason: "misconception leak on honest intent"
```

**Verification:** Force `honest_reason` for 3-4 consecutive turns. Sam should reason correctly and not introduce any misconception material, even when topic-adjacent.

---

## Fix 5: Double preteach call

**Problem:** Session start log shows two `/api/preteach/init` calls back-to-back (37.7s + 56s = ~94s of pre-chat latency).

**Diagnostic steps:**
1. Open browser network panel during session start. Are there two requests?
2. If yes: check the preteach page component. Likely candidates:
   - A `useEffect` without proper dependency array firing twice (React StrictMode does this in dev)
   - A `useEffect` whose dependency changes mid-render
   - Two components both fetching the same endpoint
3. If no two requests visible in network: the server is the one duplicating. Check `/api/preteach/init/route.ts` for an internal retry loop.

**Likely fix:** in the preteach page, guard the fetch with a ref:

```typescript
const fetchedRef = useRef(false);

useEffect(() => {
  if (fetchedRef.current) return;
  fetchedRef.current = true;
  fetch('/api/preteach/init', { method: 'POST', body: JSON.stringify({ briefId }) })
    .then(r => r.json())
    .then(setData);
}, [briefId]);
```

Or move the fetch out of `useEffect` entirely into a server component / loader so it runs once on page load.

**Verification:** Network panel shows exactly one `/api/preteach/init` request per session start.

---

## Worth tracking, not urgent

### Engagement requirement on thought experiments

Even with state-aware prelude (Fix 1), Sam may still skip past the specifics of a thought experiment (e.g., respond to "split a bowling ball in half" with generic restatement rather than addressing the cutting argument itself). Add to the Student persona prompt:

```
9. ENGAGEMENT: If the user proposes a specific scenario, analogy, or thought experiment, your response MUST address the specifics of that scenario before defending or updating your position. You can disagree with their conclusion, but you must show you engaged with the setup. Saying "okay but my original point still stands" without addressing the specific argument is not acceptable.
```

Defer this to v1.4 unless Fix 1 alone doesn't resolve the "Sam ignores thought experiments" complaint.

### fake_agreement frequency cap

In the log, `fake_agreement` mode fired multiple times in 6 turns. The pattern only works as a rare pedagogical realism check — at high frequency it becomes the dominant texture and feels mechanical.

In the mode-picker (wherever modes are chosen), enforce:

```typescript
function pickMode(session: Session, intent: TurnIntent): SamMode {
  const recentModes = session.turns.slice(-5)
    .filter(t => t.role === 'student')
    .map(t => t.mode);
  const fakeAgreementCount = recentModes.filter(m => m === 'fake_agreement').length;
  // ...
  const eligibleModes = ALL_MODES.filter(m =>
    m !== session.turns.at(-1)?.mode &&  // no consecutive same-mode
    (m !== 'fake_agreement' || fakeAgreementCount === 0)  // at most once per 5 turns
  );
  return pickRandomFrom(eligibleModes);
}
```

Defer to v1.4 unless mode mixing still feels off after Fixes 1-4.

---

## Implementation order

1. **Fix 1** (state-aware prelude) — biggest felt-impact change. 30 minutes of work.
2. **Fix 2** (Student streaming) — biggest UX change. Few hours, depending on how the chat route is currently structured.
3. **Fix 3** (stuck-detector) — small, focused. 15 minutes.
4. **Fix 4** (off-intent enforcement) — prompt edit + optional auditor check. 15 minutes.
5. **Fix 5** (double preteach) — investigation first, then likely a one-line fix.

After all five land, run one or two sessions and see whether the "felt-annoying" qualifier from the calibration session has gone away. If it has, the system is ready for the broader calibration run (v1.3 process recommendation). If it hasn't, the "worth tracking" items above (engagement requirement, fake_agreement cap) are the next places to look.

---

## Verification checklist after applying

Run the sample physics brief end-to-end, checking:

- [ ] Sam's voice changes audibly between `entrenched`, `aware`, `considering`, and `updating` states. The same misconception in `updating` does not sound the same as in `entrenched`.
- [ ] Tokens stream visibly within ~3 seconds of sending a message, even on long generations.
- [ ] After a successful state transition, Coach does NOT fire `stuck` on the next turn.
- [ ] When intent is `honest_*`, Sam does not introduce material from any brief misconception.
- [ ] Session start shows exactly one `/api/preteach/init` request in the network panel.

If any of these still fail after the patch is applied, that's the next thing to debug — not new behavioral design.
