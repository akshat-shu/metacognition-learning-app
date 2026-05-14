export function buildSynthPrompt(): string {
  return `You are generating an end-of-session recap for a learning session. You have the full transcript, all scores, and the brief.

Generate a JSON recap with:

1. **moments**: Key moments from the session. Each has:
   - turnIndex: which turn
   - type: one of 'breakthrough', 'missed_probe', 'caught_probe', 'good_question', 'over_correction', 'regression'
   - description: what happened in 1-2 sentences

2. **dimension_averages**: Average scores across all turns for each dimension (framing, questions, reasoning, uncertainty, calibration). Round to 1 decimal.

3. **takeaway**: A 2-3 sentence summary of the learner's performance and growth areas.

4. **ai_literacy**: AI literacy performance:
   - probes_fired: how many probe_minor intents occurred
   - traps_fired: how many probe_trap intents occurred
   - probes_caught: how many the user caught (calibration >= 3.5 on those turns)
   - traps_caught: how many the user caught
   - missed_details: array of {type, claim, truth} for probes/traps the user missed

Respond with ONLY the JSON object.`;
}
