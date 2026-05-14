import { NextRequest, NextResponse } from 'next/server';
import { getSession, saveSession, sessionToJSON } from '@/lib/session';
import { callJSONValidated } from '@/lib/openrouter';
import { SynthesisResultSchema } from '@/lib/schemas';
import { buildSynthMessages } from '@/lib/contextBuilder';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    session.endedAt = Date.now();

    const messages = buildSynthMessages(session);
    const synthesis = await callJSONValidated(messages, 'judge', SynthesisResultSchema);

    saveSession(session);

    return NextResponse.json({
      synthesis,
      session: sessionToJSON(session),
    });
  } catch (error) {
    console.error('Session end error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recap' },
      { status: 500 },
    );
  }
}
