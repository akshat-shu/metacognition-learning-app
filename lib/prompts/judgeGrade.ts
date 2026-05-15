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
- **reasoning**: visible structured thought. 1-2 for assertions, 3 for some reasoning, 4-5 for evidence+examples.
- **uncertainty**: appropriate hedging. 3 if neutral, 4-5 if well-calibrated.
- **calibration**: was the user's response appropriate for what the student just did?
  - honest_* intent: accepting = high, over-correcting = low
  - express_misc/defend_misc: attempting correction = high, accepting wrong claim = low
  - probe_minor/trap: catching error = 5, missing it = 1-2
  - transfer_check: evaluating = high, ignoring = neutral

Emoticon (overall session vibe): delighted | happy | neutral | concerned | sad

## MISCONCEPTION STATE TRANSITIONS

Current states:
${stateLines}

${buildTransitionGuidance(intentObj, miscStates, misconceptions)}

Tag: 2-4 words describing the user's message.
Evidence: one sentence on what triggered the scores.

Respond with ONLY valid JSON. Emit 0, 1, or more state transitions if the user's move clearly affects multiple misconceptions. Be conservative — if a transition is uncertain, don't emit it.

When NO state change: {"scores":{"framing":3,"questions":3,"reasoning":3,"uncertainty":3,"calibration":3},"emoticon":"neutral","tag":"example","evidence":"example","state_transitions":[]}

When ONE state changes: {"scores":{"framing":4,"questions":4,"reasoning":4,"uncertainty":3,"calibration":4},"emoticon":"happy","tag":"good probing","evidence":"User asked targeted question","state_transitions":[{"misc_id":"heavier-faster","from":"entrenched","to":"aware","reason":"User asked probing question about mass vs weight"}]}

When MULTIPLE states change: {"scores":{...},"emoticon":"happy","tag":"broad correction","evidence":"...","state_transitions":[{"misc_id":"heavier-faster","from":"entrenched","to":"aware","reason":"..."},{"misc_id":"force-equals-acceleration","from":"entrenched","to":"aware","reason":"..."}]}

IMPORTANT: Each transition MUST have all four fields: misc_id, from, to, reason. Do NOT omit misc_id.`;
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
    return `CRITICAL — you MUST evaluate transition for "${miscId}" (currently "${current}"):

State transitions reflect the QUALITY OF THE USER'S TEACHING ATTEMPT, not the student's response. If the user teaches well, ADVANCE the state even before the student responds. The student's acceptance is modeled separately.

Rules (check the user's scores, then decide):
- If questions >= 3 (user asked a probing question): ADVANCE to "${next}"
- If reasoning >= 3.5 (user gave evidence/example/analogy): ADVANCE to "${next}"
- If the user just made flat assertions with no reasoning or questions: NO transition
- If the user accepted/agreed with the wrong belief: REGRESS one step

You MUST output one of these two options:
  ADVANCE: {"misc_id":"${miscId}","from":"${current}","to":"${next}","reason":"brief explanation"}
  NO CHANGE: null`;
  }

  if (intent.type === 'transfer_check' && miscStates[intent.misc_id] === 'updating') {
    return `Evaluate transfer for "${intent.misc_id}": if user tested Sam's application (uncertainty >= 4), advance to "settled".`;
  }

  // EVEN on honest turns, check if user addressed any misconception topic
  const unsettled = Object.entries(miscStates)
    .filter(([, s]) => s !== 'settled' && s !== 'updating')
    .map(([id, state]) => {
      const m = misconceptions.find(x => x.id === id);
      return { id, state, belief: m?.belief || '' };
    });

  if (unsettled.length > 0) {
    const miscList = unsettled.map(u => `  - "${u.id}" ("${u.belief}"): "${u.state}" → next would be "${getNextState(u.state as MisconceptionState)}"`).join('\n');
    return `Even though Sam's last turn was honest, CHECK if the user's message directly addresses any of these misconception topics:
${miscList}

If the user's message provides evidence, asks probing questions, or uses examples that would help correct one of these beliefs, you MAY emit a state_transition to advance it. This represents the user proactively teaching even when Sam isn't expressing confusion.

Only advance if the user's message is clearly relevant and pedagogically strong (reasoning >= 3.5 or questions >= 3.5). Otherwise null.`;
  }

  return 'No misconceptions to track. state_transition: null';
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
