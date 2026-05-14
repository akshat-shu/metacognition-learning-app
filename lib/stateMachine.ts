import { MisconceptionState, TurnScore, TurnIntent } from './types';

const STATE_ORDER: MisconceptionState[] = ['entrenched', 'aware', 'considering', 'updating', 'settled'];

export function canTransition(from: MisconceptionState, to: MisconceptionState): boolean {
  const fromIdx = STATE_ORDER.indexOf(from);
  const toIdx = STATE_ORDER.indexOf(to);
  // Can advance by exactly 1, or regress by exactly 1
  return Math.abs(toIdx - fromIdx) === 1;
}

export function advanceState(current: MisconceptionState): MisconceptionState | null {
  const idx = STATE_ORDER.indexOf(current);
  if (idx < STATE_ORDER.length - 1) return STATE_ORDER[idx + 1];
  return null;
}

export function regressState(current: MisconceptionState): MisconceptionState | null {
  const idx = STATE_ORDER.indexOf(current);
  if (idx > 0) return STATE_ORDER[idx - 1];
  return null;
}

export function getStateIndex(state: MisconceptionState): number {
  return STATE_ORDER.indexOf(state);
}

export function isIntentForMisconception(intent: TurnIntent, miscId: string): boolean {
  if (intent.type === 'express_misc' && intent.misc_id === miscId) return true;
  if (intent.type === 'defend_misc' && intent.misc_id === miscId) return true;
  if (intent.type === 'transfer_check' && intent.misc_id === miscId) return true;
  return false;
}

export function applyTransition(
  miscStates: Record<string, MisconceptionState>,
  transition: { misc_id: string; from: string; to: string } | null,
): Record<string, MisconceptionState> {
  if (!transition) return miscStates;
  const { misc_id, to } = transition;
  if (misc_id in miscStates && STATE_ORDER.includes(to as MisconceptionState)) {
    return { ...miscStates, [misc_id]: to as MisconceptionState };
  }
  return miscStates;
}
