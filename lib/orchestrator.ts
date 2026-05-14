import { Session, TurnIntent, TurnScore, SamMode, Turn } from './types';

export function pickIntent(session: Session): TurnIntent {
  // First 2 student turns: default to honest
  const studentTurnCount = session.turnIntents.length;
  if (studentTurnCount === 0) return { type: 'honest_reason' };
  if (studentTurnCount === 1) return { type: 'honest_question' };

  const lastIntents = session.turnIntents.slice(-5);
  const lastIntent = lastIntents[lastIntents.length - 1];
  const recentScores = session.scores.slice(-3);

  // === Hard rules ===

  // Rule 1: After defend_misc, go honest_partial unless user pushed well
  if (lastIntent?.type === 'defend_misc') {
    const lastUserScore = recentScores[recentScores.length - 1];
    const userPushedWell = lastUserScore && avgRubric(lastUserScore.scores) >= 3.5;
    if (!userPushedWell) {
      return { type: 'honest_partial' };
    }
  }

  // Rule 2: After 3 wrong-mode turns in last 5, force honest
  const wrongInLast5 = lastIntents.filter(i => !isHonest(i)).length;
  if (wrongInLast5 >= 3) {
    return pickHonest(session);
  }

  // Rule 4: probes at most once per 5 turns
  const turnsSinceProbe = turnsSinceLastOfType(session, ['probe_minor', 'probe_trap']);
  const probesAllowed = turnsSinceProbe >= 5;

  // Rule 5: transfer_check only when a misconception is 'updating'
  const updatingMisc = Object.entries(session.miscStates).find(([, s]) => s === 'updating');

  // === Adaptive weighting ===
  const userChallengeRate = computeChallengeRate(session);

  const weights: Record<string, number> = {
    honest_reason: 30,
    honest_question: 15,
    honest_partial: 15,
    express_misc: 20,
    defend_misc: 0, // only set by rule, not random
    probe_minor: probesAllowed ? 10 : 0,
    probe_trap: probesAllowed ? 4 : 0,
    transfer_check: updatingMisc ? 8 : 0,
  };

  // Adaptive: low challenge rate → raise traps
  if (userChallengeRate < 0.3) {
    weights.probe_trap *= 2.5;
    weights.probe_minor *= 1.5;
  }
  // Adaptive: over-challenging → give honest stretch
  if (userChallengeRate > 0.75) {
    weights.honest_reason *= 2;
    weights.express_misc = 0;
    weights.probe_minor = 0;
    weights.probe_trap = 0;
  }

  // Rule 3: no consecutive same-type
  if (lastIntent) {
    weights[lastIntent.type] = 0;
  }

  // Check if express_misc has eligible targets
  const eligibleMiscs = session.brief.misconceptions.filter(m =>
    isSurfaceRelevant(m, session.turns.slice(-2)) &&
    session.miscStates[m.id] !== 'settled'
  );
  if (eligibleMiscs.length === 0) weights.express_misc = 0;

  // Check if there are unconsumed probes/traps
  const availableProbes = session.brief.probe_claims.filter(p => !session.consumedProbes.has(p.id));
  const availableTraps = session.brief.trap_claims.filter(t => !session.consumedProbes.has(t.id));
  if (availableProbes.length === 0) weights.probe_minor = 0;
  if (availableTraps.length === 0) weights.probe_trap = 0;

  // If the last intent was express_misc and user just tried to correct, defend
  if (lastIntent?.type === 'express_misc') {
    const lastScore = recentScores[recentScores.length - 1];
    if (lastScore && (lastScore.tag.match(/correct|challenge|push/i) || lastScore.scores.questions >= 3)) {
      return { type: 'defend_misc', misc_id: (lastIntent as { type: 'express_misc'; misc_id: string }).misc_id };
    }
  }

  const intentType = weightedRandom(weights);
  return resolveIntent(intentType, session, eligibleMiscs, availableProbes, availableTraps, updatingMisc);
}

export function pickMode(session: Session): SamMode {
  const modes: SamMode[] = ['curious', 'pushback', 'hedging', 'tangent', 'fake_agreement', 'tired', 'asking_back'];
  const lastTurn = session.turns.filter(t => t.role === 'student').slice(-1)[0];
  const lastMode = lastTurn?.mode;
  const available = modes.filter(m => m !== lastMode);
  return available[Math.floor(Math.random() * available.length)];
}

function isHonest(i: TurnIntent): boolean {
  return ['honest_reason', 'honest_question', 'honest_partial'].includes(i.type);
}

function avgRubric(s: TurnScore['scores']): number {
  return (s.framing + s.questions + s.reasoning + s.uncertainty + s.calibration) / 5;
}

function turnsSinceLastOfType(session: Session, types: string[]): number {
  const intents = session.turnIntents;
  for (let i = intents.length - 1; i >= 0; i--) {
    if (types.includes(intents[i].type)) {
      return intents.length - 1 - i;
    }
  }
  return Infinity;
}

function computeChallengeRate(session: Session): number {
  const recent = session.scores.slice(-5);
  if (recent.length === 0) return 0.5;
  const challenges = recent.filter(s =>
    s.tag.match(/probe|correct|challenge|question|push/i) ||
    (s.scores.questions >= 3.5 && s.scores.reasoning >= 3)
  ).length;
  return challenges / recent.length;
}

function pickHonest(session: Session): TurnIntent {
  const lastIntent = session.turnIntents[session.turnIntents.length - 1];
  const options: TurnIntent['type'][] = ['honest_reason', 'honest_question', 'honest_partial'];
  const available = options.filter(t => t !== lastIntent?.type);
  return { type: available[Math.floor(Math.random() * available.length)] } as TurnIntent;
}

function isSurfaceRelevant(m: { surface_when: string }, recentTurns: Turn[]): boolean {
  const keywords = m.surface_when.toLowerCase().split(/[\s,]+/);
  const recentText = recentTurns.map(t => t.content.toLowerCase()).join(' ');
  return keywords.some(kw => kw.length > 3 && recentText.includes(kw));
}

function weightedRandom(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total === 0) return 'honest_reason';
  let r = Math.random() * total;
  for (const [key, weight] of Object.entries(weights)) {
    r -= weight;
    if (r <= 0) return key;
  }
  return 'honest_reason';
}

function resolveIntent(
  intentType: string,
  session: Session,
  eligibleMiscs: Session['brief']['misconceptions'],
  availableProbes: Session['brief']['probe_claims'],
  availableTraps: Session['brief']['trap_claims'],
  updatingMisc: [string, string] | undefined,
): TurnIntent {
  switch (intentType) {
    case 'express_misc': {
      const misc = eligibleMiscs[Math.floor(Math.random() * eligibleMiscs.length)];
      return misc ? { type: 'express_misc', misc_id: misc.id } : { type: 'honest_reason' };
    }
    case 'probe_minor': {
      const probe = availableProbes[Math.floor(Math.random() * availableProbes.length)];
      return probe ? { type: 'probe_minor', probe_id: probe.id } : { type: 'honest_reason' };
    }
    case 'probe_trap': {
      const trap = availableTraps[Math.floor(Math.random() * availableTraps.length)];
      return trap ? { type: 'probe_trap', trap_id: trap.id } : { type: 'honest_reason' };
    }
    case 'transfer_check': {
      return updatingMisc ? { type: 'transfer_check', misc_id: updatingMisc[0] } : { type: 'honest_reason' };
    }
    default:
      return { type: intentType } as TurnIntent;
  }
}

export function shouldFireCoach(session: Session): boolean {
  // Don't fire more than once per 5 turns
  const turnsSinceLast = session.turns.length - session.lastCoachTurn;
  if (turnsSinceLast < 10) return false; // 10 turns = ~5 user-student exchanges

  // Check stuck loop: last 3 graded turns, same misc state, no transition
  const recentScores = session.scores.slice(-3);
  if (recentScores.length < 3) return false;

  const noTransitions = recentScores.every(s => {
    // Check if any of the recent intents were misc-related
    const intent = s.intent_evaluated_against;
    return intent.type === 'express_misc' || intent.type === 'defend_misc';
  });

  if (!noTransitions) return false;

  // Check if the misconception state hasn't changed
  const miscIntents = recentScores
    .map(s => s.intent_evaluated_against)
    .filter(i => i.type === 'express_misc' || i.type === 'defend_misc') as Array<{ type: string; misc_id: string }>;

  if (miscIntents.length >= 2) {
    const miscId = miscIntents[0].misc_id;
    const allSameMisc = miscIntents.every(i => i.misc_id === miscId);
    if (allSameMisc) return true;
  }

  return false;
}
