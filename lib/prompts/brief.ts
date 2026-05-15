import { Brief, MisconceptionState } from '../types';

export function buildBriefSystemMessage(brief: Brief, miscStates: Record<string, MisconceptionState>): string {
  const miscLines = brief.misconceptions.map(m => {
    const state = miscStates[m.id] || 'entrenched';
    return `- [${state}] "${m.belief}" — depth ${m.depth}/5. Surfaces when: ${m.surface_when}`;
  }).join('\n');

  const probeLines = brief.probe_claims.map(p => `- "${p.claim}" (truth: ${p.truth})`).join('\n');
  const trapLines = brief.trap_claims.map(t => `- "${t.claim}" (truth: ${t.truth})`).join('\n');

  return `HIDDEN BRIEF (the user does not know these specifics):

Subject: ${brief.subject}
Scenario: ${brief.scenario}

Beliefs you may hold (current state shown):
${miscLines}

Topics you reason correctly about (when in honest modes):
${brief.honest_topics.join(', ')}

Side wrong claims available for probes (only when the per-turn instruction tells you to use one):
${probeLines}

Confident-but-wrong claims available for traps:
${trapLines}

What the user is trying to get you to update on (HIDDEN):
${brief.objectives.join('\n')}`;
}
