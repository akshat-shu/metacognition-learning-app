import { NextRequest } from 'next/server';
import { getSession, saveSession } from '@/lib/session';
import { callJSONValidated, streamLLM, callStudent } from '@/lib/openrouter';
import { GradeResultSchema, CoachResultSchema } from '@/lib/schemas';
import { buildStudentMessages, buildGraderMessages, buildCoachMessages } from '@/lib/contextBuilder';
import { pickIntent, pickMode, shouldFireCoach } from '@/lib/orchestrator';
import { applyTransition } from '@/lib/stateMachine';
import { TurnIntent } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userMessage } = await req.json();
    const session = getSession(sessionId);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Append user turn
    session.turns.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    // 2. Grade user message against last Sam intent
    const lastIntent: TurnIntent = session.turnIntents.length > 0
      ? session.turnIntents[session.turnIntents.length - 1]
      : { type: 'honest_reason' };

    let gradeResult;
    try {
      const graderMessages = buildGraderMessages(session, userMessage, lastIntent);
      gradeResult = await callJSONValidated(graderMessages, 'judge', GradeResultSchema);
    } catch (e) {
      console.error('Grader failed, using defaults:', e);
      gradeResult = {
        scores: { framing: 3, questions: 3, reasoning: 3, uncertainty: 3, calibration: 3 },
        emoticon: 'neutral' as const,
        tag: 'processing',
        evidence: 'Grader unavailable',
        state_transition: null,
      };
    }

    // 3. Record score
    session.scores.push({
      turnIndex: session.turns.length - 1,
      scores: gradeResult.scores,
      emoticon: gradeResult.emoticon,
      tag: gradeResult.tag,
      evidence: gradeResult.evidence,
      intent_evaluated_against: lastIntent,
    });

    // 4. Apply state transition if any
    if (gradeResult.state_transition) {
      session.miscStates = applyTransition(session.miscStates, gradeResult.state_transition);
    }

    // 5. Orchestrator picks new intent
    const newIntent = pickIntent(session);
    const mode = pickMode(session);

    // 6. Mark consumed probes/traps
    if (newIntent.type === 'probe_minor') {
      session.consumedProbes.add((newIntent as { type: 'probe_minor'; probe_id: string }).probe_id);
    } else if (newIntent.type === 'probe_trap') {
      session.consumedProbes.add((newIntent as { type: 'probe_trap'; trap_id: string }).trap_id);
    }

    // 7. Build student messages and stream response
    const studentMessages = buildStudentMessages(session, newIntent, mode);

    // Use SSE streaming
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Get full student response (non-streaming for simplicity with free tier)
          const studentResponse = await callStudent(studentMessages);

          // Send content chunks
          const words = studentResponse.split(' ');
          let accumulated = '';
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? '' : ' ') + words[i];
            accumulated += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`)
            );
          }

          // 8. Append student turn
          session.turns.push({
            role: 'student',
            content: accumulated.trim(),
            timestamp: Date.now(),
            intent: newIntent,
            mode,
          });
          session.turnIntents.push(newIntent);

          // 9. Check stuck-loop detector for Coach
          let coachNudge = null;
          if (shouldFireCoach(session)) {
            try {
              const coachMessages = buildCoachMessages(session, 'stuck');
              coachNudge = await callJSONValidated(coachMessages, 'judge', CoachResultSchema);
              session.coachNudgeCount++;
              session.lastCoachTurn = session.turns.length;
            } catch (e) {
              console.error('Coach failed:', e);
            }
          }

          // 10. Save session
          saveSession(session);

          // 11. Send final metadata event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'meta',
              scores: gradeResult.scores,
              emoticon: gradeResult.emoticon,
              tag: gradeResult.tag,
              evidence: gradeResult.evidence,
              state_transition: gradeResult.state_transition,
              coachNudge,
              miscStates: session.miscStates,
              intent: newIntent.type,
            })}\n\n`)
          );

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Failed to generate response' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
