import type { Brief, Session, SessionRecap } from "@/lib/types";

const SESSION_ID_STORAGE_KEY = "reverse-tutor:session-id";
const RECAP_STORAGE_PREFIX = "reverse-tutor:recap:";

type GlobalSessionStore = typeof globalThis & {
  __reverseTutorSessions__?: Map<string, Session>;
};

const globalStore = globalThis as GlobalSessionStore;

function sessionMap(): Map<string, Session> {
  if (!globalStore.__reverseTutorSessions__) {
    globalStore.__reverseTutorSessions__ = new Map<string, Session>();
  }
  return globalStore.__reverseTutorSessions__;
}

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

export function getSession(sessionId: string): Session | undefined {
  return sessionMap().get(sessionId);
}

export function getOrCreateSession(sessionId: string, brief: Brief): Session {
  const existing = sessionMap().get(sessionId);
  if (existing) {
    return existing;
  }
  const created: Session = {
    id: sessionId,
    brief,
    turns: [],
    scores: [],
    rollups: [],
    startedAt: Date.now(),
  };
  sessionMap().set(sessionId, created);
  return created;
}

export function saveSession(session: Session): void {
  sessionMap().set(session.id, session);
}

export function setSessionRecap(sessionId: string, recap: SessionRecap): void {
  const session = sessionMap().get(sessionId);
  if (!session) {
    console.warn(`Cannot store recap: session ${sessionId} not found.`);
    return;
  }
  session.recap = recap;
  session.endedAt = Date.now();
  sessionMap().set(sessionId, session);
}

export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(SESSION_ID_STORAGE_KEY);
}

export function setStoredSessionId(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
}

export function storeRecap(sessionId: string, recap: SessionRecap): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    `${RECAP_STORAGE_PREFIX}${sessionId}`,
    JSON.stringify(recap),
  );
}

export function readStoredRecap(sessionId: string): SessionRecap | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(`${RECAP_STORAGE_PREFIX}${sessionId}`);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SessionRecap;
  } catch (error) {
    console.error(`Failed to parse recap for session ${sessionId}:`, error);
    return null;
  }
}
