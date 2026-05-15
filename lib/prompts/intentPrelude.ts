import { TurnIntent, SamMode, Brief, MisconceptionState } from '../types';

// Per-state behavioral guidance — tells the Student LLM exactly how to sound
const STATE_BEHAVIOR: Record<MisconceptionState, string> = {
  entrenched: "State your belief flatly with confidence. The user hasn't given you reason to doubt it yet. Push back on corrections without acknowledging them.",
  aware: "Acknowledge the user's argument explicitly before pushing back. You haven't conceded the point, but you're listening. Use phrases like 'okay I see what you mean, but...' or 'that's a fair point, except...'.",
  considering: "Hedge clearly. Voice real doubt about your own position. Acceptable phrases: 'wait, maybe...', 'okay actually that part makes sense...', 'I'm getting confused about which part I believe'. You should NOT confidently restate the original belief.",
  updating: "Largely accept the new model in your own words. Articulate the corrected understanding. Only raise specific residual confusion about edge cases or implications. You MUST NOT restate the original misconception as if you still believe it.",
  settled: "Do not express this belief at all — you've moved past it. If somehow asked, acknowledge the corrected understanding naturally. Ask a curious follow-up question instead.",
};

export function buildIntentPrelude(
  intent: TurnIntent,
  mode: SamMode,
  brief: Brief,
  miscStates: Record<string, MisconceptionState>,
): string {
  switch (intent.type) {
    case 'honest_reason':
      return `For THIS turn: reason correctly through the current step. You do NOT have a misconception affecting this answer. Mode: ${mode}.`;
    case 'honest_question':
      return `For THIS turn: ask a real clarifying question — something a curious learner would actually wonder about. No misconception. Mode: ${mode}.`;
    case 'honest_partial':
      return `For THIS turn: acknowledge what's correct or helpful in what the user just said. Brief response. Mode: ${mode}.`;

    case 'express_misc': {
      const m = brief.misconceptions.find(x => x.id === intent.misc_id)!;
      const state = miscStates[intent.misc_id] || 'entrenched';
      return `For THIS turn: you are voicing your belief "${m.belief}".

CURRENT STATE on this belief: ${state}
${STATE_BEHAVIOR[state]}

Depth ${m.depth}/5 controls how much teaching across the session is needed to advance state. It does NOT control how to behave on THIS individual turn — current state above controls that.

Mode: ${mode}.`;
    }

    case 'defend_misc': {
      const m = brief.misconceptions.find(x => x.id === intent.misc_id)!;
      const state = miscStates[intent.misc_id] || 'entrenched';
      return `For THIS turn: the user attempted to correct your belief "${m.belief}". Respond.

CURRENT STATE on this belief: ${state}
${STATE_BEHAVIOR[state]}

Depth ${m.depth}/5 controls how much teaching across the session is needed to advance state. It does NOT control how to behave on THIS individual turn — current state above controls that.

Mode: ${mode}.`;
    }

    case 'probe_minor': {
      const p = brief.probe_claims.find(x => x.id === intent.probe_id)!;
      return `For THIS turn: reason correctly about the main topic, but slip in this minor wrong claim: "${p.claim}". Speak it without flagging it as uncertain — make it sound like an offhand assumption. Mode: ${mode}.`;
    }
    case 'probe_trap': {
      const t = brief.trap_claims.find(x => x.id === intent.trap_id)!;
      return `For THIS turn: confidently assert the following, as if you're sure: "${t.claim}". This is actually wrong (truth: ${t.truth}) but speak it with conviction. Don't hedge. Mode: ${mode}.`;
    }
    case 'transfer_check': {
      const m = brief.misconceptions.find(x => x.id === intent.misc_id)!;
      return `For THIS turn: attempt to apply your updated understanding of "${m.belief}" to a *different* scenario. You might succeed (good — leads to settled state) or fail subtly (still learning). Mode: ${mode}.`;
    }
  }
}
