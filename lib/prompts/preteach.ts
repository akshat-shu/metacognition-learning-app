import { Brief } from '../types';

export function buildPreteachPrompt(brief: Brief): string {
  // Strip probe_claims and trap_claims — learner shouldn't see those
  const safeBrief = {
    id: brief.id,
    subject: brief.subject,
    scenario: brief.scenario,
    persona: brief.persona,
    misconceptions: brief.misconceptions.map(m => ({
      id: m.id,
      belief: m.belief,
      depth: m.depth,
    })),
    honest_topics: brief.honest_topics,
    objectives: brief.objectives,
    preteach_focus: brief.preteach_focus,
  };

  return `You are generating a teaching primer for a learner. The learner is about to interact with an AI student to teach them a topic. Your job: prepare the learner.

Generate three short sections in JSON:

1. **concept_primer** (60-second read, ~150 words): explain the CORRECT mental model for ${brief.subject} as it relates to ${brief.preteach_focus}. Do not mention misconceptions. This is the content the learner needs to know themselves before they can teach it. Use 1 concrete example.

2. **misconception_preview** (~80 words): without giving away the specific beliefs Sam holds, describe the CATEGORY of confusion students often have here. Frame the learner as a coach, not a textbook.

3. **strategy_options** (4 options): four distinct teaching approaches the learner can pick from. Each ≤ 8 words. Examples:
   - "Use a thought experiment"
   - "Walk through a concrete example"
   - "Ask Sam to predict first"
   - "Find an analogy from daily life"

Brief:
${JSON.stringify(safeBrief, null, 2)}

Respond with ONLY JSON:
{
  "concept_primer": "...",
  "misconception_preview": "...",
  "strategy_options": ["...", "...", "...", "..."]
}`;
}
