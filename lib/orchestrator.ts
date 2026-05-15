import { Session, TurnIntent, TurnScore, SamMode, Turn, CoachTrigger } from './types';

export function pickIntent(session: Session): TurnIntent {
  const studentTurnCount = session.turnIntents.length;

  // First turn: honest question to open naturally
  if (studentTurnCount === 0) return attachTrace({ type: 'honest_question' }, {}, 'honest_question');

  // Second turn: express the first entrenched misconception — get into it early
  if (studentTurnCount === 1) {
    const firstMisc = session.brief.misconceptions.find(m => session.miscStates[m.id] === 'entrenched');
    if (firstMisc) return attachTrace({ type: 'express_misc', misc_id: firstMisc.id }, {}, 'express_misc');
    return attachTrace({ type: 'honest_reason' }, {}, 'honest_reason');
  }

  const lastIntents = session.turnIntents.slice(-5);
  const lastIntent = lastIntents[lastIntents.length - 1];
  const recentScores = session.scores.slice(-3);

  // === Fix 3: Force transfer_check when a misconception just hit 'updating' ===
  const lastScore = recentScores[recentScores.length - 1];
  if (lastScore) {
    // Check if the most recent grader turn produced a transition to 'updating'
    const justUpdated = Object.entries(session.miscStates).find(([id, s]) => {
      if (s !== 'updating') return false;
      // Check last student turn's trace for state change
      const lastStudentTurn = session.turns.filter(t => t.role === 'student').slice(-1)[0];
      const before = lastStudentTurn?.trace?.stateBeforeTurn?.[id];
      return before && before !== 'updating';
    });
    if (justUpdated) {
      return attachTrace({ type: 'transfer_check', misc_id: justUpdated[0] }, {}, 'transfer_check_forced');
    }
  }

  // === Hard rules ===

  // Rule 1: After defend_misc, go honest_partial unless user pushed well
  if (lastIntent?.type === 'defend_misc') {
    const lastUserScore = recentScores[recentScores.length - 1];
    const userPushedWell = lastUserScore && avgRubric(lastUserScore.scores) >= 3.5;
    if (!userPushedWell) {
      return attachTrace({ type: 'honest_partial' }, {}, 'honest_partial');
    }
  }

  // Rule: probes at most once per 5 turns
  const turnsSinceProbe = turnsSinceLastOfType(session, ['probe_minor', 'probe_trap']);
  const probesAllowed = turnsSinceProbe >= 5;

  // Rule: transfer_check only when a misconception is 'updating'
  const updatingMisc = Object.entries(session.miscStates).find(([, s]) => s === 'updating');

  // === Eligible misconceptions ===
  const entrenched = session.brief.misconceptions.filter(m => session.miscStates[m.id] === 'entrenched');
  const aware = session.brief.misconceptions.filter(m => session.miscStates[m.id] === 'aware');
  const considering = session.brief.misconceptions.filter(m => session.miscStates[m.id] === 'considering');
  const activeUnsettled = [...entrenched, ...aware, ...considering];

  // === If last intent was express_misc and user challenged, defend ===
  if (lastIntent?.type === 'express_misc') {
    const miscId = (lastIntent as { type: 'express_misc'; misc_id: string }).misc_id;
    const miscState = session.miscStates[miscId];
    if (miscState === 'entrenched' || miscState === 'aware') {
      const lastScore = recentScores[recentScores.length - 1];
      if (lastScore && (lastScore.scores.questions >= 3 || lastScore.scores.reasoning >= 3)) {
        return attachTrace({ type: 'defend_misc', misc_id: miscId }, {}, 'defend_misc');
      }
    }
  }

  // === Adaptive weighting ===
  const userChallengeRate = computeChallengeRate(session);
  const miscWeight = activeUnsettled.length > 0 ? 35 : 0;

  const weights: Record<string, number> = {
    honest_reason: 20,
    honest_question: 10,
    honest_partial: 10,
    express_misc: miscWeight,
    defend_misc: 0,
    probe_minor: probesAllowed ? 8 : 0,
    probe_trap: probesAllowed ? 4 : 0,
    transfer_check: updatingMisc ? 12 : 0,
  };

  // Adaptive: low challenge rate → more traps
  if (userChallengeRate < 0.3) {
    weights.probe_trap *= 2.5;
    weights.probe_minor *= 1.5;
  }
  // Adaptive: over-challenging → give honest stretch
  if (userChallengeRate > 0.75) {
    weights.honest_reason *= 2;
    weights.express_misc *= 0.5;
    weights.probe_minor = 0;
    weights.probe_trap = 0;
  }

  // Fix 4: Soft pacing — 0.3x multiplier instead of hard zero for consecutive same-type
  if (lastIntent) {
    weights[lastIntent.type] = (weights[lastIntent.type] ?? 0) * 0.3;
  }

  // Fix 4: After 3 wrong in last 5, heavy bias toward honest (not hard force)
  const wrongInLast5 = lastIntents.filter(i => !isHonest(i)).length;
  if (wrongInLast5 >= 3) {
    weights.honest_reason *= 3;
    weights.honest_question *= 3;
    weights.honest_partial *= 3;
    weights.express_misc *= 0.2;
    weights.probe_minor = 0;
    weights.probe_trap = 0;
  }

  // No probes/traps if exhausted
  const availableProbes = session.brief.probe_claims.filter(p => !session.consumedProbes.has(p.id));
  const availableTraps = session.brief.trap_claims.filter(t => !session.consumedProbes.has(t.id));
  if (availableProbes.length === 0) weights.probe_minor = 0;
  if (availableTraps.length === 0) weights.probe_trap = 0;

  // Fix 5: Top-k filter — exclude intents with weight < 15% of max
  const intentType = topKWeightedRandom(weights);
  console.log(`[Orchestrator] Turn ${studentTurnCount}: picked ${intentType} (weights: ${JSON.stringify(weights)})`);
  const intent = resolveIntent(intentType, session, activeUnsettled, availableProbes, availableTraps, updatingMisc);
  return attachTrace(intent, weights, intentType);
}

function attachTrace(intent: TurnIntent, weights: Record<string, number>, picked: string): TurnIntent {
  (intent as any).__weights = { ...weights };
  (intent as any).__picked = picked;
  return intent;
}

export function pickMode(session: Session): SamMode {
  const modes: SamMode[] = ['curious', 'pushback', 'hedging', 'tangent', 'fake_agreement', 'tired', 'asking_back'];
  const recentStudentTurns = session.turns.filter(t => t.role === 'student').slice(-5);
  const lastMode = recentStudentTurns[recentStudentTurns.length - 1]?.mode;
  const recentModes = recentStudentTurns.map(t => t.mode);
  const fakeAgreementCount = recentModes.filter(m => m === 'fake_agreement').length;
  const available = modes.filter(m =>
    m !== lastMode &&
    (m !== 'fake_agreement' || fakeAgreementCount === 0)
  );
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

// Fix 5: Top-k weighted random — filter out weights < 15% of max before sampling
function topKWeightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  if (entries.length === 0) return 'honest_reason';

  const max = Math.max(...entries.map(([, w]) => w));
  const threshold = max * 0.15;
  const filtered = entries.filter(([, w]) => w >= threshold);
  if (filtered.length === 0) return 'honest_reason';

  const total = filtered.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, weight] of filtered) {
    r -= weight;
    if (r <= 0) return key;
  }
  return filtered[filtered.length - 1][0];
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
      const entrenched = eligibleMiscs.filter(m => session.miscStates[m.id] === 'entrenched');
      const pool = entrenched.length > 0 ? entrenched : eligibleMiscs;
      const misc = pool[Math.floor(Math.random() * pool.length)];
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

// === Coach triggers (Fixes 6-7) ===

export function decideCoachTrigger(session: Session): CoachTrigger | null {
  const cooldownOk = session.turns.length - session.lastCoachTurn >= 3;
  if (!cooldownOk) return null;

  // Transfer check trigger
  const updatingMisc = Object.entries(session.miscStates).find(([, s]) => s === 'updating');
  if (updatingMisc) {
    const lastStudentTurn = session.turns.filter(t => t.role === 'student').slice(-1)[0];
    if (lastStudentTurn?.trace?.stateBeforeTurn) {
      const before = lastStudentTurn.trace.stateBeforeTurn[updatingMisc[0]];
      if (before && before !== 'updating') return 'transfer_check';
    }
  }

  const recentScores = session.scores.slice(-3);
  if (recentScores.length < 2) return null;

  // Stuck: same misconception targeted 2+ times WITHOUT forward transitions in recent window
  const miscIntents = recentScores
    .map(s => s.intent_evaluated_against)
    .filter(i => i.type === 'express_misc' || i.type === 'defend_misc') as Array<{ type: string; misc_id: string }>;
  if (miscIntents.length >= 2) {
    const miscId = miscIntents[0].misc_id;
    if (miscIntents.every(i => i.misc_id === miscId)) {
      // Check if any forward transition happened in the recent window
      const recentStudentTurns = session.turns.filter(t => t.role === 'student').slice(-3);
      const hadForwardTransition = recentStudentTurns.some(t => {
        const before = t.trace?.stateBeforeTurn?.[miscId];
        const after = t.trace?.stateAfterTurn?.[miscId];
        if (!before || !after) return false;
        const ORDER = ['entrenched', 'aware', 'considering', 'updating', 'settled'];
        return ORDER.indexOf(after) > ORDER.indexOf(before);
      });
      if (!hadForwardTransition) return 'stuck';
    }
  }

  // Reasoning weak: last 3 reasoning scores all ≤ 2, or declining to ≤ 2.5
  if (recentScores.length >= 3) {
    const reasoning = recentScores.map(s => s.scores.reasoning);
    const allWeak = reasoning.every(r => r <= 2);
    const declining = reasoning[0] > reasoning[2] && reasoning[2] <= 2.5;
    if (allWeak || declining) return 'reasoning_weak';
  }

  // Soft nudge: 1+ turn at same state + low reasoning
  const lastReasoningScore = recentScores[recentScores.length - 1]?.scores.reasoning ?? 3;
  if (miscIntents.length >= 1 && lastReasoningScore <= 2.5) return 'soft_nudge';

  return null;
}

// Keep legacy export for backward compat during migration
export function shouldFireCoach(session: Session): boolean {
  return decideCoachTrigger(session) !== null;
}
