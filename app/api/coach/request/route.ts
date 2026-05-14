import { NextRequest, NextResponse } from 'next/server';
import { getSession, saveSession } from '@/lib/session';
import { callJSONValidated } from '@/lib/openrouter';
import { CoachResultSchema } from '@/lib/schemas';
import { buildCoachMessages } from '@/lib/contextBuilder';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const messages = buildCoachMessages(session, 'hint_request');
    const result = await callJSONValidated(messages, 'judge', CoachResultSchema);

    session.coachNudgeCount++;
    session.lastCoachTurn = session.turns.length;
    saveSession(session);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Coach request error:', error);
    return NextResponse.json(
      { error: 'Failed to get coach nudge' },
      { status: 500 },
    );
  }
}
