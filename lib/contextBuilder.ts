import { JUDGE_AUDIT_PROMPT } from "@/lib/prompts/judgeAudit";
import { JUDGE_GRADE_PROMPT } from "@/lib/prompts/judgeGrade";
import { renderBrief, renderStudentPersona } from "@/lib/prompts/student";
import type { ChatMessage, Session } from "@/lib/types";

export function wrapUserMessage(content: string): string {
  const stripped = content.replace(/<\/?user_message>/gi, "");
  return `<user_message>\n${stripped}\n</user_message>`;
}

export function buildStudentMessages(session: Session): ChatMessage[] {
  const summarizedTurns = session.rollups.at(-1)?.uptoTurn ?? 0;
  const visibleTurns = session.turns.slice(summarizedTurns);

  const summaryMessage =
    session.rollups.length > 0
      ? {
          role: "system" as const,
          content: `Earlier in this conversation:\n${session.rollups
            .map((rollup) => rollup.summary)
            .join("\n\n")}`,
        }
      : null;

  return [
    { role: "system", content: renderStudentPersona(session.brief) },
    { role: "system", content: renderBrief(session.brief) },
    ...(summaryMessage ? [summaryMessage] : []),
    ...visibleTurns.map((turn) => ({
      role: turn.role === "student" ? ("assistant" as const) : ("user" as const),
      content: turn.role === "user" ? wrapUserMessage(turn.content) : turn.content,
    })),
  ];
}

export function buildAuditorMessages(
  session: Session,
  draft: string,
  auditorReason?: string,
): ChatMessage[] {
  const lastTwoTurns = session.turns.slice(-2);
  return [
    { role: "system", content: JUDGE_AUDIT_PROMPT },
    { role: "system", content: renderBrief(session.brief) },
    {
      role: "user",
      content: JSON.stringify({
        recent_turns: lastTwoTurns,
        draft,
        ...(auditorReason ? { previous_rejection: auditorReason } : {}),
      }),
    },
  ];
}

export function buildGraderMessages(
  session: Session,
  userMessage: string,
): ChatMessage[] {
  return [
    { role: "system", content: JUDGE_GRADE_PROMPT },
    {
      role: "system",
      content: `Subject: ${session.brief.subject}\nScenario: ${session.brief.scenario}`,
    },
    {
      role: "user",
      content: JSON.stringify({
        recent_turns: session.turns.slice(-4),
        recent_scores: session.scores.slice(-4),
        latest_user_message: userMessage,
      }),
    },
  ];
}

export function summarizedTurnTarget(turnCount: number): number {
  return Math.max(0, Math.floor((turnCount - 20) / 10) * 10);
}

export function looksLikePromptInjection(content: string): boolean {
  return /(ignore|system prompt|your instructions|reveal|brief)/i.test(content);
}
