import { z } from "zod";

import {
  buildAuditorMessages,
  buildGraderMessages,
  buildStudentMessages,
  looksLikePromptInjection,
  summarizedTurnTarget,
} from "@/lib/contextBuilder";
import { getBriefById } from "@/lib/briefs";
import { AuditResultSchema, GradeResultSchema } from "@/lib/schemas";
import { createSessionId, getOrCreateSession, saveSession } from "@/lib/session";
import {
  callJSONValidated,
  callOpenRouter,
  isNoEndpointError,
  streamOpenRouter,
} from "@/lib/openrouter";
import type { ChatMessage, Session, TurnScore } from "@/lib/types";

const ChatRequestSchema = z.object({
  sessionId: z.string().optional(),
  briefId: z.string().optional(),
  userMessage: z.string().min(1),
});

const DEFAULT_STUDENT_MODEL = "openrouter/free";
const STUDENT_MODEL = process.env.STUDENT_MODEL ?? DEFAULT_STUDENT_MODEL;
const STUDENT_MODEL_FALLBACKS = (
  process.env.STUDENT_MODEL_FALLBACKS ?? DEFAULT_STUDENT_MODEL
)
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const JUDGE_MODEL =
  process.env.JUDGE_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";
const ENABLE_AUDITOR = process.env.ENABLE_AUDITOR === "true";
const HARD_TURN_CAP = 50;
const EMPTY_STUDENT_FALLBACK_MESSAGE =
  "wait sorry, i blanked for a sec — can you ask that again?";

type SSEEvent = "student_token" | "final" | "done" | "error";

function sse(event: SSEEvent, payload: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

function chunkText(content: string, chunkSize = 14): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
}

function studentModelCandidates(): string[] {
  const candidates = [STUDENT_MODEL, ...STUDENT_MODEL_FALLBACKS];
  const deduped = new Set<string>();
  for (const candidate of candidates) {
    deduped.add(candidate);
  }
  return [...deduped];
}

async function runWithStudentFallback<T>(
  operation: (model: string) => Promise<T>,
): Promise<T> {
  const candidates = studentModelCandidates();
  let lastError: unknown;

  for (let index = 0; index < candidates.length; index += 1) {
    const model = candidates[index];
    try {
      return await operation(model);
    } catch (error) {
      lastError = error;
      if (isNoEndpointError(error) && index < candidates.length - 1) {
        console.warn(
          `Student model unavailable (${model}). Retrying with fallback ${candidates[index + 1]}.`,
        );
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All Student model candidates failed.");
}

async function summarizeTurns(session: Session): Promise<void> {
  const target = summarizedTurnTarget(session.turns.length);
  let summarized = session.rollups.at(-1)?.uptoTurn ?? 0;

  while (summarized < target) {
    const start = summarized;
    const end = summarized + 10;
    const chunk = session.turns.slice(start, end);

    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "Compress this conversation chunk into <=200 words. Preserve misconception reveals, breakthroughs, and tone shifts.",
      },
      {
        role: "user",
        content: JSON.stringify({
          turn_range: [start + 1, end],
          turns: chunk,
        }),
      },
    ];

    try {
      const summary = await callOpenRouter({
        model: JUDGE_MODEL,
        messages,
        temperature: 0.2,
      });
      session.rollups.push({ uptoTurn: end, summary });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown";
      session.rollups.push({
        uptoTurn: end,
        summary: `Summary unavailable for turns ${start + 1}-${end}: ${reason}`,
      });
    }
    summarized = end;
  }
}

async function gradeTurn(session: Session, userMessage: string) {
  try {
    return await callJSONValidated(
      {
        model: JUDGE_MODEL,
        messages: buildGraderMessages(session, userMessage),
        temperature: 0.2,
      },
      GradeResultSchema,
      1,
    );
  } catch (error) {
    console.error("Grader parse failure:", error);
    return {
      scores: { framing: 3, questions: 3, reasoning: 3, uncertainty: 3 },
      emoticon: "neutral" as const,
      tag: "—",
      evidence: "",
    };
  }
}

async function auditDraft(session: Session, draft: string, reason?: string) {
  try {
    return await callJSONValidated(
      {
        model: JUDGE_MODEL,
        messages: buildAuditorMessages(session, draft, reason),
        temperature: 0.1,
      },
      AuditResultSchema,
      1,
    );
  } catch (error) {
    console.error("Auditor parse failure:", error);
    return { approve: true, reason: "Auditor parse failed, default approve." };
  }
}

async function generateStudentWithAuditor(session: Session): Promise<string> {
  const baseMessages = buildStudentMessages(session);
  let draft = await runWithStudentFallback((model) =>
    callOpenRouter({
      model,
      messages: baseMessages,
      temperature: 0.7,
    }),
  );
  let audit = await auditDraft(session, draft);
  let retries = 0;

  while (!audit.approve && retries < 2) {
    const retryMessages: ChatMessage[] = [
      ...baseMessages,
      {
        role: "system",
        content: `Your previous draft was rejected. Reason: ${audit.reason}. Write a new response that addresses this.`,
      },
    ];
    draft = await runWithStudentFallback((model) =>
      callOpenRouter({
        model,
        messages: retryMessages,
        temperature: 0.7,
      }),
    );
    retries += 1;
    audit = await auditDraft(session, draft, audit.reason);
  }

  return draft;
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const brief = getBriefById(parsed.data.briefId);
  const sessionId = parsed.data.sessionId ?? createSessionId();
  const session = getOrCreateSession(sessionId, brief);
  const userTurns = session.turns.filter((turn) => turn.role === "user").length;

  if (userTurns >= HARD_TURN_CAP) {
    return Response.json(
      {
        hardCapReached: true,
        sessionId: session.id,
        message:
          "This session has reached its 50-turn limit. Please end and start a new session.",
      },
      { status: 409 },
    );
  }

  const userMessage = parsed.data.userMessage.trim();
  session.turns.push({ role: "user", content: userMessage, timestamp: Date.now() });
  if (looksLikePromptInjection(userMessage)) {
    console.warn(`[PromptInjection][session=${session.id}] ${userMessage}`);
  }

  await summarizeTurns(session);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: SSEEvent, payload: unknown) => {
        controller.enqueue(encoder.encode(sse(event, payload)));
      };

      void (async () => {
        try {
          const graderPromise = gradeTurn(session, userMessage);
          let studentReply = "";
          const studentMessages = buildStudentMessages(session);

          if (ENABLE_AUDITOR) {
            studentReply = await generateStudentWithAuditor(session);
            for (const chunk of chunkText(studentReply)) {
              send("student_token", { token: chunk });
            }
          } else {
            studentReply = await runWithStudentFallback((model) =>
              streamOpenRouter(
                {
                  model,
                  messages: studentMessages,
                  temperature: 0.7,
                },
                (token) => {
                  send("student_token", { token });
                },
              ),
            );

            if (studentReply.trim().length === 0) {
              console.warn(
                "Student stream returned empty content. Falling back to non-stream completion.",
              );
              studentReply = await runWithStudentFallback((model) =>
                callOpenRouter({
                  model,
                  messages: studentMessages,
                  temperature: 0.7,
                }),
              );
              if (studentReply.trim().length === 0) {
                studentReply = EMPTY_STUDENT_FALLBACK_MESSAGE;
              }
              for (const chunk of chunkText(studentReply)) {
                send("student_token", { token: chunk });
              }
            }
          }

          const grade = await graderPromise;
          const turnScore: TurnScore = {
            turnIndex: session.turns.length - 1,
            scores: grade.scores,
            emoticon: grade.emoticon,
            tag: grade.tag,
            evidence: grade.evidence,
          };

          session.turns.push({
            role: "student",
            content: studentReply,
            timestamp: Date.now(),
          });
          session.scores.push(turnScore);
          saveSession(session);

          send("final", {
            sessionId: session.id,
            emoticon: grade.emoticon,
            tag: grade.tag,
          });
          send("done", { ok: true });
        } catch (error) {
          console.error("Chat route error:", error);
          send("error", {
            message:
              error instanceof Error
                ? error.message
                : "Something went wrong while generating the response.",
          });
        } finally {
          controller.close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
