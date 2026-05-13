export type Misconception = {
  id: string;
  belief: string;
  depth: 1 | 2 | 3 | 4 | 5;
  surface_when: string;
};

export type Brief = {
  id: string;
  subject: string;
  scenario: string;
  persona: { name: string; age: number; vibe: string };
  misconceptions: Misconception[];
  objectives: string[];
};

export type Turn = {
  role: "user" | "student";
  content: string;
  timestamp: number;
};

export type EmoticonState =
  | "delighted"
  | "happy"
  | "neutral"
  | "concerned"
  | "sad";

export type TurnScore = {
  turnIndex: number;
  scores: {
    framing: number;
    questions: number;
    reasoning: number;
    uncertainty: number;
  };
  emoticon: EmoticonState;
  tag: string;
  evidence: string;
};

export type RecapMoment = {
  turn_index: number;
  type: "breakthrough" | "missed_opportunity" | "pivot" | "stumble";
  summary: string;
  why_it_mattered: string;
  try_next_time: string;
};

export type SessionRecap = {
  moments: RecapMoment[];
  summary: {
    averages: {
      framing: number;
      questions: number;
      reasoning: number;
      uncertainty: number;
    };
    trend: "improving" | "flat" | "declining";
    takeaway: string;
  };
};

export type RollingSummary = {
  uptoTurn: number;
  summary: string;
};

export type Session = {
  id: string;
  brief: Brief;
  turns: Turn[];
  scores: TurnScore[];
  rollups: RollingSummary[];
  startedAt: number;
  endedAt?: number;
  recap?: SessionRecap;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
