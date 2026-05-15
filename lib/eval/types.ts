export type Playbook = {
  id: string;
  name: string;
  description: string;
  briefId: string;
  strategies: string[];
  turns: string[];
  assertions: Assertion[];
};

export type Assertion = {
  name: string;
  check: (trace: PlaybookTrace) => AssertionResult;
};

export type AssertionResult = {
  pass: boolean;
  detail?: string;
};

export type TurnTrace = {
  turnIndex: number;
  userMessage: string;
  studentReply: string;
  scores?: Record<string, number>;
  emoticon?: string;
  tag?: string;
  evidence?: string;
  stateTransition?: { misc_id: string; from: string; to: string; reason: string } | null;
  miscStatesAfter?: Record<string, string>;
  intent?: string;
  coachNudge?: { nudge: string; type: string } | null;
  durationMs: number;
  error?: string;
};

export type PlaybookTrace = {
  playbookId: string;
  playbookName: string;
  sessionId?: string;
  opener?: string;
  turns: TurnTrace[];
  finalMiscStates?: Record<string, string>;
  totalDurationMs: number;
  setupError?: string;
};

export type AssertionRun = {
  name: string;
  pass: boolean;
  detail?: string;
};

export type PlaybookRun = {
  trace: PlaybookTrace;
  assertions: AssertionRun[];
  passCount: number;
  failCount: number;
};
