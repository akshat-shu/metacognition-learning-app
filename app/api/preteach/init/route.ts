import { NextRequest, NextResponse } from 'next/server';
import { getBrief } from '@/lib/briefs';
import { callJSONValidated } from '@/lib/openrouter';
import { PreteachResultSchema } from '@/lib/schemas';
import { buildPreteachPrompt } from '@/lib/prompts/preteach';

export async function POST(req: NextRequest) {
  try {
    const { briefId } = await req.json();
    const brief = getBrief(briefId);
    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    const messages = [
      { role: 'user' as const, content: buildPreteachPrompt(brief) },
    ];

    const result = await callJSONValidated(messages, 'judge', PreteachResultSchema, 2, { reasoningEffort: 'low' });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Preteach init error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preteach content' },
      { status: 500 },
    );
  }
}
