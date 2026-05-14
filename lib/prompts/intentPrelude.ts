import { TurnIntent, SamMode, Brief, MisconceptionState } from '../types';

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
      const state = miscStates[intent.misc_id];
      if (state === 'entrenched') {
        return `For THIS turn: express the belief "${m.belief}". You fully believe this. Depth ${m.depth}/5. Mode: ${mode}. Speak this belief in your own voice, fitting the conversation naturally.`;
      }
      if (state === 'aware') {
        return `For THIS turn: you're starting to question "${m.belief}" but haven't let go. Express it with some doubt — "I mean, I think..." or "but isn't it true that...". Show you heard the user but haven't fully shifted. Mode: ${mode}.`;
      }
      return `For THIS turn: you're actively reconsidering "${m.belief}". You're not sure anymore. Express genuine confusion — "wait, so does that mean..." or "okay but then why...". Show real engagement with the user's arguments. Mode: ${mode}.`;
    }
    case 'defend_misc': {
      const m = brief.misconceptions.find(x => x.id === intent.misc_id)!;
      const state = miscStates[intent.misc_id];
      if (state === 'aware' || state === 'considering') {
        return `For THIS turn: the user attempted to correct "${m.belief}". You're wavering but not convinced yet. Push back gently — ask for more evidence, express what still doesn't click. Don't flatly deny, but don't fully agree either. Mode: ${mode}.`;
      }
      return `For THIS turn: the user attempted to correct "${m.belief}". Push back. If their attempt was strong (evidence, analogy, example), hedge or partially update; if weak (assertion, "trust me"), hold firm. Mode: ${mode}.`;
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
