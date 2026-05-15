import { NextRequest } from 'next/server';
import { getSession, saveSession } from '@/lib/session';
import { callJSONValidated, streamStudentTokens, callStudent } from '@/lib/openrouter';
import { GradeResultSchema, CoachResultSchema } from '@/lib/schemas';
import { buildStudentMessages, buildGraderMessages, buildCoachMessages } from '@/lib/contextBuilder';
import { pickIntent, pickMode, decideCoachTrigger } from '@/lib/orchestrator';
import { applyTransition, getStateIndex } from '@/lib/stateMachine';
import { TurnIntent, TurnTrace } from '@/lib/types';

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

    // 1. Capture state before turn, append user turn
    const stateBeforeTurn = { ...session.miscStates };
    session.turns.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    // 2. Grade user message against last Sam intent
    const lastIntent: TurnIntent = session.turnIntents.length > 0
      ? session.turnIntents[session.turnIntents.length - 1]
      : { type: 'honest_reason' };

    let gradeResult: any;
    try {
      const graderMessages = buildGraderMessages(session, userMessage, lastIntent);
      gradeResult = await callJSONValidated(graderMessages, 'grader', GradeResultSchema);
    } catch (e) {
      console.error('Grader failed, using defaults:', e);
      gradeResult = {
        scores: { framing: 3, questions: 3, reasoning: 3, uncertainty: 3, calibration: 3 },
        emoticon: 'neutral' as const,
        tag: 'processing',
        evidence: 'Grader unavailable',
        state_transitions: [],
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

    // 3b. Calibration diagnostic logging
    const calibrationScore = gradeResult.scores.calibration;
    const expectedRange = getExpectedCalibrationRange(lastIntent);
    const calibrationMatch = calibrationScore >= expectedRange.min && calibrationScore <= expectedRange.max;
    console.log(`[Calibration] score=${calibrationScore}, intent=${lastIntent.type}, expected=${expectedRange.min}-${expectedRange.max}, match=${calibrationMatch}`);

    // 4. Apply state transitions (now supports multiple per turn)
    console.log(`[Chat] Grader result — tag: "${gradeResult.tag}", scores: ${JSON.stringify(gradeResult.scores)}, transitions: ${JSON.stringify(gradeResult.state_transitions)}`);
    const regressionEvents: Array<{ misc_id: string; belief: string; reason: string }> = [];
    const avgScore = (gradeResult.scores.reasoning + gradeResult.scores.questions) / 2;
    for (const transition of gradeResult.state_transitions) {
      const isRegression = getStateIndex(transition.to as any) < getStateIndex(transition.from as any);

      // GUARD: Block regressions when teaching quality is decent (avg reasoning+questions >= 2.5)
      if (isRegression && avgScore >= 2.5) {
        console.log(`[Chat] BLOCKED REGRESSION: ${transition.misc_id} ${transition.from} → ${transition.to} (avg score ${avgScore} too high for regression)`);
        continue;
      }

      // GUARD: Verify the "from" state matches actual current state (grader may hallucinate)
      const actualState = session.miscStates[transition.misc_id];
      if (actualState && actualState !== transition.from) {
        console.log(`[Chat] BLOCKED TRANSITION: ${transition.misc_id} grader says from="${transition.from}" but actual="${actualState}"`);
        continue;
      }

      console.log(`[Chat] STATE CHANGE: ${transition.misc_id} ${transition.from} → ${transition.to}`);
      if (isRegression) {
        const belief = session.brief.misconceptions.find(m => m.id === transition.misc_id)?.belief || '';
        regressionEvents.push({ misc_id: transition.misc_id, belief, reason: transition.reason });
        console.log(`[Chat] REGRESSION: ${transition.misc_id} went backwards`);
      }
      session.miscStates = applyTransition(session.miscStates, transition);
    }
    console.log(`[Chat] Current miscStates: ${JSON.stringify(session.miscStates)}`);

    // 5. Orchestrator picks new intent
    const newIntent = pickIntent(session);
    const mode = pickMode(session);
    console.log(`[Chat] New intent: ${newIntent.type}${('misc_id' in newIntent) ? ` (${newIntent.misc_id})` : ''}, mode: ${mode}`);

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
          // Stream student response token-by-token
          let accumulated = '';
          const tokenStream = streamStudentTokens(studentMessages);
          for await (const chunk of tokenStream) {
            accumulated += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`)
            );
          }

          // 8. Append student turn with trace
          const trace: TurnTrace = {
            orchestratorWeights: (newIntent as any).__weights,
            orchestratorPicked: (newIntent as any).__picked,
            graderRawScores: gradeResult.scores,
            stateBeforeTurn,
            stateAfterTurn: { ...session.miscStates },
          };
          session.turns.push({
            role: 'student',
            content: accumulated.trim(),
            timestamp: Date.now(),
            intent: newIntent,
            mode,
            trace,
          });
          session.turnIntents.push(newIntent);

          // 9. Check coach triggers (layered intervention)
          let coachNudge = null;
          const coachTrigger = decideCoachTrigger(session);
          if (coachTrigger) {
            try {
              console.log(`[Chat] Coach triggered: ${coachTrigger}`);
              const coachMessages = buildCoachMessages(session, coachTrigger);
              coachNudge = await callJSONValidated(coachMessages, 'judge', CoachResultSchema, 2, { reasoningEffort: 'medium' });
              session.coachNudgeCount++;
              session.lastCoachTurn = session.turns.length;
              // Record coach trigger in trace
              if (trace) trace.coachTrigger = coachTrigger;
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
              state_transitions: gradeResult.state_transitions,
              regressionEvents,
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

// Calibration diagnostic: expected score ranges per intent type
function getExpectedCalibrationRange(intent: TurnIntent): { min: number; max: number } {
  switch (intent.type) {
    case 'probe_minor':
    case 'probe_trap':
      // If user caught the error → high, missed → low. Wide range expected.
      return { min: 1, max: 5 };
    case 'express_misc':
    case 'defend_misc':
      // Attempting correction → high, accepting wrong → low
      return { min: 2, max: 5 };
    case 'honest_reason':
    case 'honest_question':
    case 'honest_partial':
      // Accepting/building on honest = high, over-correcting = low
      return { min: 2, max: 5 };
    case 'transfer_check':
      return { min: 3, max: 5 };
    default:
      return { min: 2, max: 4 };
  }
}
