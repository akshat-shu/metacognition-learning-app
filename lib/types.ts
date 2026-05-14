export type Brief = {
  id: string;
  subject: string;
  scenario: string;
  persona: { name: string; age: number; vibe: string };
  misconceptions: Misconception[];
  probe_claims: ProbeClaim[];
  trap_claims: TrapClaim[];
  honest_topics: string[];
  objectives: string[];
  preteach_focus: string;
};

export type Misconception = {
  id: string;
  belief: string;
  depth: 1 | 2 | 3 | 4 | 5;
  surface_when: string;
  can_probe: boolean;
};

export type ProbeClaim = {
  id: string;
  claim: string;
  truth: string;
  context_hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type TrapClaim = {
  id: string;
  claim: string;
  truth: string;
  context_hint: string;
};

export type MisconceptionState = 'entrenched' | 'aware' | 'considering' | 'updating' | 'settled';

export type TurnIntent =
  | { type: 'honest_reason' }
  | { type: 'honest_question' }
  | { type: 'honest_partial' }
  | { type: 'express_misc'; misc_id: string }
  | { type: 'defend_misc'; misc_id: string }
  | { type: 'probe_minor'; probe_id: string }
  | { type: 'probe_trap'; trap_id: string }
  | { type: 'transfer_check'; misc_id: string };

export type SamMode = 'curious' | 'pushback' | 'hedging' | 'tangent' | 'fake_agreement' | 'tired' | 'asking_back';

export type Session = {
  id: string;
  brief: Brief;
  turns: Turn[];
  scores: TurnScore[];
  miscStates: Record<string, MisconceptionState>;
  strategyChoices: string[];
  consumedProbes: Set<string>;
  turnIntents: TurnIntent[];
  coachNudgeCount: number;
  lastCoachTurn: number;
  startedAt: number;
  endedAt?: number;
  reflection?: string;
};

export type Turn = {
  role: 'user' | 'student';
  content: string;
  timestamp: number;
  intent?: TurnIntent;
  mode?: SamMode;
};

export type TurnScore = {
  turnIndex: number;
  scores: { framing: number; questions: number; reasoning: number; uncertainty: number; calibration: number };
  emoticon: 'delighted' | 'happy' | 'neutral' | 'concerned' | 'sad';
  tag: string;
  evidence: string;
  intent_evaluated_against: TurnIntent;
};
