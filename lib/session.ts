import { Session, Brief, MisconceptionState } from './types';

// In-memory store (server-side only)
const sessions = new Map<string, Session>();

export function createSession(brief: Brief, strategyChoices: string[]): Session {
  const miscStates: Record<string, MisconceptionState> = {};
  for (const m of brief.misconceptions) {
    miscStates[m.id] = 'entrenched';
  }

  const session: Session = {
    id: generateId(),
    brief,
    turns: [],
    scores: [],
    miscStates,
    strategyChoices,
    consumedProbes: new Set(),
    turnIntents: [],
    coachNudgeCount: 0,
    lastCoachTurn: -10,
    startedAt: Date.now(),
  };

  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function saveSession(session: Session): void {
  sessions.set(session.id, session);
}

function generateId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// For API responses — serialize Set to array
export function sessionToJSON(session: Session) {
  return {
    ...session,
    consumedProbes: Array.from(session.consumedProbes),
  };
}
