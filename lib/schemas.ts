import { z } from 'zod';

const VALID_STATES = ['entrenched', 'aware', 'considering', 'updating', 'settled'] as const;

// Preprocess state_transition to handle common LLM output variations
const StateTransitionSchema = z.preprocess((val) => {
  // null, undefined, empty → null
  if (val === null || val === undefined || val === 'null') return null;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    // Empty object → null
    if (Object.keys(obj).length === 0) return null;
    // Must have from and to at minimum
    const from = obj.from || obj.current || obj.from_state;
    const to = obj.to || obj.next || obj.to_state;
    const misc_id = obj.misc_id || obj.miscId || obj.misconception_id || obj.id || '';
    const reason = obj.reason || obj.explanation || '';
    if (from && to && VALID_STATES.includes(from as string) && VALID_STATES.includes(to as string)) {
      return { misc_id: String(misc_id), from, to, reason: String(reason) };
    }
    // Has some fields but not valid states → null
    return null;
  }
  return null;
}, z.union([
  z.object({
    misc_id: z.string(),
    from: z.enum(VALID_STATES),
    to: z.enum(VALID_STATES),
    reason: z.string().optional().default(''),
  }),
  z.null(),
]));

export const GradeResultSchema = z.object({
  scores: z.object({
    framing: z.number().min(1).max(5),
    questions: z.number().min(1).max(5),
    reasoning: z.number().min(1).max(5),
    uncertainty: z.number().min(1).max(5),
    calibration: z.number().min(1).max(5),
  }),
  emoticon: z.string().transform((val): 'delighted' | 'happy' | 'neutral' | 'concerned' | 'sad' => {
    const valid = ['delighted', 'happy', 'neutral', 'concerned', 'sad'] as const;
    if (valid.includes(val as any)) return val as any;
    // Map common LLM outputs to valid emoticons
    if (/delight|excell|🎉|🌟|🎯/.test(val)) return 'delighted';
    if (/happy|good|👍|😊|positive/.test(val)) return 'happy';
    if (/concern|worry|😟|⚠/.test(val)) return 'concerned';
    if (/sad|poor|😢|bad/.test(val)) return 'sad';
    return 'neutral';
  }),
  tag: z.string().max(80),
  evidence: z.string(),
  state_transition: StateTransitionSchema,
});

export const CoachResultSchema = z.object({
  nudge: z.string().min(1).max(800),
  type: z.enum(['stuck', 'hint_request', 'transfer_check']),
});

export const PreteachResultSchema = z.preprocess((val) => {
  if (typeof val !== 'object' || val === null) return val;
  const obj = val as Record<string, unknown>;
  // Normalize known model typos / aliases for concept_primer
  if (obj.concept_primer === undefined) {
    const alias =
      obj.concept_prider ??
      obj.conceptPrimer ??
      obj.concept_intro ??
      obj.concept_summary ??
      obj.primer;
    if (alias !== undefined) {
      return { ...obj, concept_primer: alias };
    }
  }
  return obj;
}, z.object({
  concept_primer: z.string().min(50).max(1500),
  misconception_preview: z.string().min(30).max(800),
  strategy_options: z.array(z.string().max(50)).length(4),
}));

export const AuditResultSchema = z.object({
  approve: z.boolean(),
  reason: z.string(),
});

export const SynthesisResultSchema = z.object({
  moments: z.array(z.object({
    turnIndex: z.number(),
    type: z.enum(['breakthrough', 'missed_probe', 'caught_probe', 'good_question', 'over_correction', 'regression']),
    description: z.string(),
  })),
  dimension_averages: z.object({
    framing: z.number(),
    questions: z.number(),
    reasoning: z.number(),
    uncertainty: z.number(),
    calibration: z.number(),
  }),
  takeaway: z.string(),
  ai_literacy: z.object({
    probes_fired: z.number(),
    traps_fired: z.number(),
    probes_caught: z.number(),
    traps_caught: z.number(),
    missed_details: z.array(z.object({
      type: z.enum(['probe', 'trap']),
      claim: z.string(),
      truth: z.string(),
    })),
  }),
});

export type GradeResult = z.infer<typeof GradeResultSchema>;
export type CoachResult = z.infer<typeof CoachResultSchema>;
export type PreteachResult = z.infer<typeof PreteachResultSchema>;
export type AuditResult = z.infer<typeof AuditResultSchema>;
export type SynthesisResult = z.infer<typeof SynthesisResultSchema>;
