import { z } from "zod";

import { JUDGE_SYNTH_PROMPT } from "@/lib/prompts/judgeSynth";
import { SynthResultSchema } from "@/lib/schemas";
import { getSession, saveSession } from "@/lib/session";
import { callJSONValidated } from "@/lib/openrouter";

const SessionEndSchema = z.object({
  sessionId: z.string().min(1),
});

const JUDGE_MODEL =
  process.env.JUDGE_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = SessionEndSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid session end request." }, { status: 400 });
  }

  const session = getSession(parsed.data.sessionId);
  if (!session) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  if (session.recap) {
    return Response.json({ sessionId: session.id, recap: session.recap });
  }

  try {
    const recap = await callJSONValidated(
      {
        model: JUDGE_MODEL,
        temperature: 0.2,
        messages: [
          { role: "system", content: JUDGE_SYNTH_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              brief: session.brief,
              turns: session.turns,
              scores: session.scores,
            }),
          },
        ],
      },
      SynthResultSchema,
      1,
    );

    session.endedAt = Date.now();
    session.recap = recap;
    saveSession(session);

    return Response.json({
      sessionId: session.id,
      recap,
    });
  } catch (error) {
    console.error("Synthesis failed:", error);
    return Response.json(
      { error: "Failed to synthesize session recap." },
      { status: 502 },
    );
  }
}
