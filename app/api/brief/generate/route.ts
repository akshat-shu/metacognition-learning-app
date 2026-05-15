import { NextRequest, NextResponse } from 'next/server';
import { callJSONValidated } from '@/lib/openrouter';
import { GeneratedBriefSchema } from '@/lib/schemas';
import { buildBriefGeneratorPrompt } from '@/lib/prompts/briefGenerator';
import { registerBrief, generateBriefId } from '@/lib/briefs';
import type { Brief } from '@/lib/types';

const MAX_TOPIC = 500;
const MAX_SOURCES = 8000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const sourcesRaw = typeof body.sources === 'string' ? body.sources : '';
    const strictSources = Boolean(body.strictSources) && sourcesRaw.trim().length > 0;

    if (topic.length < 3) {
      return NextResponse.json({ error: 'Topic too short.' }, { status: 400 });
    }
    if (topic.length > MAX_TOPIC) {
      return NextResponse.json({ error: 'Topic too long.' }, { status: 400 });
    }
    if (sourcesRaw.length > MAX_SOURCES) {
      return NextResponse.json({ error: 'Sources too long.' }, { status: 400 });
    }

    const messages = [
      {
        role: 'user' as const,
        content: buildBriefGeneratorPrompt({
          topic,
          sources: sourcesRaw,
          strictSources,
        }),
      },
    ];

    // briefGen role: reasoning model + larger output budget. One-shot per session
    // and bootstraps everything downstream, so quality matters more than cost here.
    const generated = await callJSONValidated(messages, 'briefGen', GeneratedBriefSchema);

    // Coerce can_probe defaults and assign an id; the orchestrator + grader rely on these fields.
    const id = generateBriefId();
    const brief: Brief = {
      id,
      subject: generated.subject,
      scenario: generated.scenario,
      persona: generated.persona,
      misconceptions: generated.misconceptions.map(m => ({
        id: m.id,
        belief: m.belief,
        depth: m.depth,
        surface_when: m.surface_when,
        can_probe: m.can_probe ?? false,
      })),
      probe_claims: generated.probe_claims,
      trap_claims: generated.trap_claims,
      honest_topics: generated.honest_topics,
      objectives: generated.objectives,
      preteach_focus: generated.preteach_focus,
    };

    registerBrief(brief);

    return NextResponse.json({ briefId: id, brief });
  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate brief.' },
      { status: 500 },
    );
  }
}
