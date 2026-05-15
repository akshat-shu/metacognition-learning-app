import { TurnIntent, MisconceptionState, Misconception } from '../types';

export function buildGradePrompt(
  intentDescription: string,
  miscStates: Record<string, MisconceptionState>,
  intentObj: TurnIntent,
  misconceptions: Misconception[],
): string {
  const stateLines = Object.entries(miscStates).map(([id, state]) => {
    const m = misconceptions.find(x => x.id === id);
    return `  - "${id}" (belief: "${m?.belief || '?'}"): currently "${state}"`;
  }).join('\n');

  return `You are evaluating a learner's teaching skill. The learner is helping an AI student who holds misconceptions.

The AI student's MOST RECENT turn intent: ${intentDescription}

Score the user's NEW message 1-5 on these dimensions (be strict — 3 is average, 5 is exceptional):
- **framing**: scoping, focusing inquiry, setting context. Score 1-2 if vague, 3 if adequate, 4-5 if excellent.
- **questions**: probing, well-targeted. 1-2 for leading/yes-no, 3 for decent, 4-5 for Socratic.
  - **Teaching move marker**: the user may prefix their message with one of:
    "[move: ask-why]" (probing reasoning), "[move: edge-case]" (offering a counter-example),
    "[move: show-example]" (anchoring in something concrete), or "[move: compare]"
    (forcing a contrast). When a marker is present, score whether the MESSAGE BODY
    actually delivers on that move:
      - Marker + faithful execution (e.g. ask-why marker with a real "why" question) → +1 bonus toward questions/framing.
      - Marker + body that doesn't match (e.g. ask-why marker but body is a flat assertion) → cap questions at 2.
      - Markers themselves do not affect calibration; ignore them for that dimension.
    No marker = score on the move alone.
- **reasoning**: visible structured thought. 1-2 for assertions, 3 for some reasoning, 4-5 for evidence+examples.
- **uncertainty**: appropriate hedging. 3 if neutral, 4-5 if well-calibrated.
- **calibration**: was the user's response appropriate for what the student just did?
  - honest_* intent: accepting = high, over-correcting = low
  - express_misc/defend_misc: attempting correction = high, accepting wrong claim = low
  - probe_minor/trap: catching error = 5, missing it = 1-2
  - transfer_check: evaluating = high, ignoring = neutral
  - **Confidence markers**: the user may prefix their message with
    "[I'm guessing]", "[I think so]", or "[I'm sure]". This is their
    claimed confidence. Penalize miscalibration:
      - "[I'm sure]" but the move is weak or wrong → 1-2 (overconfident)
      - "[I'm guessing]" but the move is actually sharp → 2-3 (under-claimed; missed opportunity to commit)
      - Marker matches outcome (sure-and-right, or guessing-and-genuinely-tentative) → 4-5
    No marker = score calibration on the move alone, ignore this rule.

Emoticon (overall session vibe): delighted | happy | neutral | concerned | sad

## MISCONCEPTION STATE TRANSITIONS

Current states:
${stateLines}

${buildTransitionGuidance(intentObj, miscStates, misconceptions)}

Tag: 2-4 words describing the user's message.
Evidence: one sentence on what triggered the scores.

## REGRESSION RULES
Regressions (moving a state BACKWARDS) are RARE and should ONLY happen when the user EXPLICITLY agrees with or validates a wrong belief. Good teaching NEVER causes regression. Probing questions, thought experiments, and analogies are ADVANCES, not regressions. If the user's scores are >= 3 on reasoning or questions, a regression is almost certainly wrong.

Respond with ONLY valid JSON. Each transition MUST have all four fields: misc_id, from, to, reason. Transitions should ONLY advance states forward, except in the rare case described above.

Example (no change): {"scores":{"framing":3,"questions":3,"reasoning":3,"uncertainty":3,"calibration":3},"emoticon":"neutral","tag":"example","evidence":"example","state_transitions":[]}

Example (advance): {"scores":{"framing":4,"questions":4,"reasoning":4,"uncertainty":3,"calibration":4},"emoticon":"happy","tag":"good probing","evidence":"User asked targeted question","state_transitions":[{"misc_id":"heavier-faster","from":"entrenched","to":"aware","reason":"User asked probing question about mass vs weight"}]}`;
}

function buildTransitionGuidance(
  intent: TurnIntent,
  miscStates: Record<string, MisconceptionState>,
  misconceptions: Misconception[],
): string {
  // For misconception intents, give specific transition rules
  if (intent.type === 'express_misc' || intent.type === 'defend_misc') {
    const miscId = intent.misc_id;
    const current = miscStates[miscId];
    if (!current || current === 'settled') {
      return 'No transition expected (misconception already settled).';
    }
    const next = getNextState(current);
    const misc = misconceptions.find(x => x.id === miscId);
    const depth = misc?.depth ?? 3;
    const thresholds = getTransitionThresholds(current, depth);
    return `MANDATORY EVALUATION for "${miscId}" (currently "${current}", depth ${depth}/5):

State transitions reflect the QUALITY OF THE USER'S TEACHING ATTEMPT. If the user teaches well, ADVANCE the state. You MUST only emit transitions for "${miscId}" — do NOT emit transitions for other misconceptions on this turn.

${getStateContext(current)}

DECISION RULE — apply mechanically based on scores:
- If questions >= ${thresholds.questions} → EMIT ADVANCE to "${next}"
- If reasoning >= ${thresholds.reasoning} → EMIT ADVANCE to "${next}"
- If BOTH questions < ${thresholds.questions} AND reasoning < ${thresholds.reasoning} → no transition
- Regression requires the user to EXPLICITLY agree the wrong belief is correct (extremely rare)

You MUST include exactly one transition for "${miscId}" if either threshold is met:
  {"misc_id":"${miscId}","from":"${current}","to":"${next}","reason":"brief explanation"}`;
  }

  if (intent.type === 'transfer_check' && miscStates[intent.misc_id] === 'updating') {
    return `Evaluate transfer for "${intent.misc_id}": if user tested Sam's application (uncertainty >= 3), advance to "settled".`;
  }

  // EVEN on honest turns, check if user addressed any misconception topic
  const unsettled = Object.entries(miscStates)
    .filter(([, s]) => s !== 'settled' && s !== 'updating')
    .map(([id, state]) => {
      const m = misconceptions.find(x => x.id === id);
      return { id, state, belief: m?.belief || '', depth: m?.depth ?? 3 };
    });

  if (unsettled.length > 0) {
    const miscList = unsettled.map(u => {
      const thresholds = getTransitionThresholds(u.state as MisconceptionState, u.depth);
      return `  - "${u.id}" ("${u.belief}"): "${u.state}" → next would be "${getNextState(u.state as MisconceptionState)}" (need questions >= ${thresholds.questionsHonest} or reasoning >= ${thresholds.reasoningHonest})`;
    }).join('\n');
    return `Even though Sam's last turn was honest, CHECK if the user's message directly addresses any of these misconception topics:
${miscList}

If the user's message provides evidence, asks probing questions, or uses examples that would help correct one of these beliefs, you SHOULD emit a state_transition to advance it. This represents the user proactively teaching even when Sam isn't expressing confusion.

Advance any misconception whose topic the user clearly addresses with sufficient quality (see thresholds above). Multiple transitions are fine.`;
  }

  return 'No misconceptions to track. state_transition: null';
}

// Thresholds scale with state progression and depth:
// Later states (considering→updating) need LESS force since Sam is already doubting.
// Lower depth means easier transitions overall.
function getTransitionThresholds(state: MisconceptionState, depth: number): {
  questions: number; reasoning: number; questionsHonest: number; reasoningHonest: number;
} {
  const depthMod = depth <= 2 ? -0.5 : depth >= 4 ? 0.5 : 0;
  switch (state) {
    case 'entrenched': return {
      questions: 3 + depthMod, reasoning: 3.5 + depthMod,
      questionsHonest: 3.5 + depthMod, reasoningHonest: 4 + depthMod,
    };
    case 'aware': return {
      questions: 2.5 + depthMod, reasoning: 3 + depthMod,
      questionsHonest: 3 + depthMod, reasoningHonest: 3.5 + depthMod,
    };
    case 'considering': return {
      questions: 2 + depthMod, reasoning: 2.5 + depthMod,
      questionsHonest: 2.5 + depthMod, reasoningHonest: 3 + depthMod,
    };
    default: return {
      questions: 3, reasoning: 3.5,
      questionsHonest: 3.5, reasoningHonest: 3.5,
    };
  }
}

function getStateContext(state: MisconceptionState): string {
  switch (state) {
    case 'entrenched': return 'The student fully believes this misconception. A strong teaching move is needed to create initial doubt.';
    case 'aware': return 'The student is listening but still pushes back. A clear explanation or good question should move them forward.';
    case 'considering': return 'The student is already actively doubting their belief. Even a moderate teaching move (analogy, example, follow-up question) should be enough to push to "updating". The bar is LOWER here — the student is primed to shift.';
    default: return '';
  }
}

function getNextState(state: MisconceptionState): string {
  const order: MisconceptionState[] = ['entrenched', 'aware', 'considering', 'updating', 'settled'];
  const idx = order.indexOf(state);
  return idx < order.length - 1 ? order[idx + 1] : state;
}

export function describeIntent(intent: TurnIntent): string {
  switch (intent.type) {
    case 'honest_reason': return 'Student was reasoning correctly (honest mode)';
    case 'honest_question': return 'Student asked a genuine clarifying question (honest mode)';
    case 'honest_partial': return 'Student acknowledged a correct point (honest mode)';
    case 'express_misc': return `Student expressed misconception "${intent.misc_id}"`;
    case 'defend_misc': return `Student defended misconception "${intent.misc_id}" against correction`;
    case 'probe_minor': return `Student slipped in minor wrong claim (probe: ${intent.probe_id})`;
    case 'probe_trap': return `Student confidently asserted something subtly wrong (trap: ${intent.trap_id})`;
    case 'transfer_check': return `Student tried applying understanding to new case (misc: ${intent.misc_id})`;
  }
}
