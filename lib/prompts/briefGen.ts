export function buildBriefGenPrompt(topic: string): string {
  return `You are designing a "Reverse Tutor" learning session. A human learner will try to teach an AI student (Sam) about a topic. Your job: given a topic, produce a full session brief as JSON.

Topic: ${topic}

Generate the following JSON object exactly:

{
  "subject": "precise label, e.g. 'Chemistry — Le Chatelier\\'s principle'",
  "scenario": "1-2 sentences written from Sam's perspective: what just happened in class and why Sam is confused or skeptical",
  "persona": {
    "name": "Sam",
    "age": 15,
    "vibe": "brief personality description in 8-12 words, e.g. 'eager but overconfident, jumps to conclusions, casual tone'"
  },
  "misconceptions": [
    {
      "id": "kebab-case-id",
      "belief": "exact wrong belief as a sentence Sam would say, e.g. 'Heavier things always fall faster because gravity pulls them more.'",
      "depth": 3,
      "surface_when": "short phrase: when this belief surfaces, e.g. 'comparing objects of different masses'",
      "can_probe": false
    }
  ],
  "probe_claims": [
    {
      "id": "kebab-case-id",
      "claim": "subtle factual error Sam would slip in while otherwise reasoning correctly",
      "truth": "correct answer in 1-2 sentences",
      "context_hint": "when Sam would use this claim",
      "difficulty": "easy"
    }
  ],
  "trap_claims": [
    {
      "id": "kebab-case-id",
      "claim": "confidently wrong claim Sam asserts",
      "truth": "correct answer in 1-2 sentences",
      "context_hint": "when Sam would use this"
    }
  ],
  "honest_topics": ["subtopic Sam actually understands correctly (unrelated to misconceptions)", "..."],
  "objectives": ["thing 1 the learner should help Sam understand", "thing 2", "thing 3"],
  "preteach_focus": "one sentence: the correct mental model concept the learner themselves needs to understand before they can help Sam"
}

Rules:
- Include 2-3 misconceptions. Make them feel authentic — things real students genuinely believe.
- Include 2 probe_claims (subtle errors) and 2 trap_claims (confident wrong assertions).
- Include 3-4 honest_topics — subtopics Sam handles correctly, so Sam doesn't seem always wrong.
- depth is an integer 1-5: 1 = surface confusion, 5 = deeply entrenched belief.
- Keep all string values concise (no bullet lists, no markdown inside values).
- All id fields must be unique kebab-case strings.

Respond with ONLY the JSON object. No explanation, no markdown fences, no indentation (output compact JSON on one line to save tokens).`;
}
