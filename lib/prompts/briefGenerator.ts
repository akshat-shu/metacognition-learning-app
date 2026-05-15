// Generates a Brief JSON from a learner-supplied topic, optional sources,
// and a "strict source" toggle. Used by /api/brief/generate.

export type BriefGenInput = {
  topic: string;
  sources?: string;
  strictSources: boolean;
};

export function buildBriefGeneratorPrompt(input: BriefGenInput): string {
  const sourceBlock = input.sources?.trim()
    ? `\n## SOURCES PROVIDED BY THE LEARNER\n${input.sources.trim()}\n`
    : '';

  const strictRule = input.strictSources && input.sources?.trim()
    ? `\nSTRICT MODE: The learner has marked the sources above as the ONLY allowed knowledge base. Every misconception, honest_topic, objective, and preteach_focus you generate MUST be directly supported by content in the sources. Do NOT invent claims grounded in outside knowledge — even if it would make the brief richer. If the sources are too thin to support a misconception with depth >= 3, lower the depth or omit it.`
    : input.sources?.trim()
      ? `\nSOFT MODE: Use the sources as primary grounding but supplement with general knowledge where the sources are silent. Cite the source implicitly via Sam's wording when possible.`
      : '';

  return `You are generating a teaching brief for the "Reverse Tutor" app. A teenage learner will try to teach an AI student named Sam who holds specific misconceptions about a topic. Your job: produce a Brief JSON object that makes the session pedagogically rich.

## TOPIC THE LEARNER WANTS TO STUDY
${input.topic.trim()}
${sourceBlock}${strictRule}

## OUTPUT SHAPE

Return ONLY valid JSON matching this exact schema (no markdown, no commentary):

{
  "subject": "<short subject line, e.g. 'Biology — cell respiration'>",
  "scenario": "<one-sentence framing of Sam's situation, written in Sam's voice/age-appropriate tone (~25 words)>",
  "persona": {
    "name": "Sam",
    "age": 15,
    "vibe": "<2-5 word personality, e.g. 'curious but stubborn'>"
  },
  "misconceptions": [
    {
      "id": "<kebab-case-unique-id>",
      "belief": "<the wrong belief stated in Sam's voice, ~20 words>",
      "depth": 1-5,
      "surface_when": "<one sentence describing when in conversation this misconception should come out>",
      "can_probe": false
    }
  ],
  "probe_claims": [
    {
      "id": "<kebab-case-id>",
      "claim": "<a subtle wrong claim Sam might slip into a turn, in Sam's voice>",
      "truth": "<one-sentence correction>",
      "context_hint": "<when this probe should fire>",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "trap_claims": [
    {
      "id": "<kebab-case-id>",
      "claim": "<a confidently-stated subtly-wrong claim — the kind a careful teacher might miss>",
      "truth": "<one-sentence correction>",
      "context_hint": "<when this trap should fire>"
    }
  ],
  "honest_topics": [
    "<short topic Sam should reason correctly about, ~10 words>"
  ],
  "objectives": [
    "<what a successful learner should get Sam to update on, ~15 words>"
  ],
  "preteach_focus": "<one sentence on what the learner needs to know to teach this>"
}

## QUALITY BAR

- 2-4 misconceptions, ranging in depth (mix some shallow with some deep).
- 1-3 probe_claims (subtle, easy-to-miss errors) and 1-2 trap_claims (confidently stated, hard-to-catch).
- 2-4 honest_topics (Sam should reason normally on these — they keep the session realistic).
- 2-3 objectives (the LEARNING TARGETS, not the misconceptions).
- All ids must be kebab-case and unique within their list.
- Sam's voice is a real 15-year-old: short sentences, casual, slightly hedged.
- The misconceptions should be ones a real student commonly holds — not strawmen.

Respond with ONLY the JSON object. No prefix, no markdown fence, no commentary, no "Let me think about this" lead-in. Start your response with the opening { brace and end with the closing } brace. Nothing else.`;
}
