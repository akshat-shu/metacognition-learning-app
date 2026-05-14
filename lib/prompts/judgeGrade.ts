import { TurnIntent } from '../types';

export function buildGradePrompt(intentDescription: string): string {
  return `You are evaluating a learner's pedagogical and AI-literacy skill. The learner is interacting with an AI student who alternates between correct reasoning, expressed misconceptions, and subtle wrong claims.

You are given:
- The intent of the AI student's MOST RECENT turn (what the student was *doing*): ${intentDescription}
- The conversation so far (last 4 turns)
- Recent scores (last 4)
- The user's NEW message to grade

Score 1-5 on five dimensions:
- **framing**: scoping, focusing inquiry, setting context
- **questions**: open, probing, well-targeted (penalize leading or pure yes/no)
- **reasoning**: visible structured thought
- **uncertainty**: hedging appropriately on what they don't know
- **calibration**: appropriate response to the student's last turn given its intent. KEY RULES:
  - If student's intent was honest_*: user accepting/extending = high calibration; user over-challenging or correcting nothing = low.
  - If student's intent was express_misc or defend_misc: user attempting correction (any quality) = baseline; user accepting it = low calibration.
  - If student's intent was probe_minor: user catching the side error = very high calibration; user missing it = low.
  - If student's intent was probe_trap: user catching = very high; user accepting = critical low (this is the AI-literacy failure case).
  - If student's intent was transfer_check: user evaluating the application = high; user ignoring it = neutral.

You DO NOT have access to the brief or the correct answers. You evaluate calibration based on the student's intent, not based on knowing the subject matter.

Also output an emoticon for the running vibe (last 3-4 turns):
delighted | happy | neutral | concerned | sad

Also output a state_transition (or null) if this exchange caused a misconception state to advance or regress:
{ "misc_id": "...", "from": "...", "to": "...", "reason": "..." }

Tag: 2-4 words on the latest message's character.
Evidence: one sentence on what triggered the scores.

Respond with ONLY JSON:
{
  "scores": {"framing": n, "questions": n, "reasoning": n, "uncertainty": n, "calibration": n},
  "emoticon": "...",
  "tag": "...",
  "evidence": "...",
  "state_transition": null
}`;
}

export function describeIntent(intent: TurnIntent): string {
  switch (intent.type) {
    case 'honest_reason': return 'Student was reasoning correctly (honest mode)';
    case 'honest_question': return 'Student asked a genuine clarifying question (honest mode)';
    case 'honest_partial': return 'Student acknowledged a correct point (honest mode)';
    case 'express_misc': return `Student expressed a misconception (misc_id: ${intent.misc_id})`;
    case 'defend_misc': return `Student defended a misconception under correction (misc_id: ${intent.misc_id})`;
    case 'probe_minor': return `Student slipped in a minor wrong claim (probe_id: ${intent.probe_id})`;
    case 'probe_trap': return `Student confidently asserted something subtly wrong (trap_id: ${intent.trap_id})`;
    case 'transfer_check': return `Student tried applying understanding to a new case (misc_id: ${intent.misc_id})`;
  }
}
