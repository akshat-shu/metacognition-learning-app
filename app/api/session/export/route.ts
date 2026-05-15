import { NextRequest, NextResponse } from 'next/server';
import { getSession, sessionToJSON } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const exported = sessionToJSON(session);
    return new Response(JSON.stringify(exported, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="session-${session.id}.json"`,
      },
    });
  } catch (error) {
    console.error('Session export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
