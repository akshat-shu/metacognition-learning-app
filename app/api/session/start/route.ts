import { NextRequest, NextResponse } from 'next/server';
import { getBrief } from '@/lib/briefs';
import { createSession, sessionToJSON } from '@/lib/session';
import { callStudent } from '@/lib/openrouter';
import { buildStudentMessages } from '@/lib/contextBuilder';
import { pickMode } from '@/lib/orchestrator';
import { TurnIntent } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { briefId, strategyChoices } = await req.json();
    const brief = getBrief(briefId);
    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    const session = createSession(brief, strategyChoices || []);

    // Generate Sam's opener with honest_question intent
    const intent: TurnIntent = { type: 'honest_question' };
    const mode = pickMode(session);
    const messages = buildStudentMessages(session, intent, mode);
    const opener = await callStudent(messages);

    // Record the opener
    session.turns.push({
      role: 'student',
      content: opener,
      timestamp: Date.now(),
      intent,
      mode,
    });
    session.turnIntents.push(intent);

    return NextResponse.json({
      sessionId: session.id,
      opener,
      session: sessionToJSON(session),
    });
  } catch (error) {
    console.error('Session start error:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 },
    );
  }
}
