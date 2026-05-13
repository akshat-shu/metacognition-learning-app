export const JUDGE_SYNTH_PROMPT = `You are reviewing a complete teaching session. The user was teaching an AI student who held specific misconceptions. Identify 3-4 pedagogically interesting moments — turning points, breakthrough questions, missed opportunities, places where the user changed approach.

For each moment, provide:
- turn_index
- type: "breakthrough" | "missed_opportunity" | "pivot" | "stumble"
- summary: what happened in 1-2 sentences
- why_it_mattered: the pedagogical significance
- try_next_time: specific suggestion

Then provide an aggregate growth summary: average per dimension, trend (improving/flat/declining), and one overall takeaway.

Respond with ONLY this JSON:
{
  "moments": [...],
  "summary": {
    "averages": {"framing": n, "questions": n, "reasoning": n, "uncertainty": n},
    "trend": "improving|flat|declining",
    "takeaway": "<one paragraph>"
  }
}`;
