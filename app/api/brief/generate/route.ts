import { NextRequest, NextResponse } from 'next/server';
import { callJSONValidated } from '@/lib/openrouter';
import { BriefGenerationSchema } from '@/lib/schemas';
import { buildBriefGenPrompt } from '@/lib/prompts/briefGen';
import { registerBrief } from '@/lib/briefs';
import type { Brief } from '@/lib/types';

function generateBriefId(): string {
  return `brief_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const trimmedTopic = topic.trim().slice(0, 200);
    const messages = [{ role: 'user' as const, content: buildBriefGenPrompt(trimmedTopic) }];
    const generated = await callJSONValidated(messages, 'judge', BriefGenerationSchema, 2, 3000);

    const brief: Brief = { ...generated, id: generateBriefId() };
    registerBrief(brief);

    return NextResponse.json({ briefId: brief.id });
  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 });
  }
}
