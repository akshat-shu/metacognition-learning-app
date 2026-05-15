import { z } from 'zod';

const VALID_STATES: readonly string[] = ['entrenched', 'aware', 'considering', 'updating', 'settled'];
const VALID_STATES_ENUM = ['entrenched', 'aware', 'considering', 'updating', 'settled'] as const;

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
    from: z.enum(VALID_STATES_ENUM),
    to: z.enum(VALID_STATES_ENUM),
    reason: z.string().optional().default(''),
  }),
  z.null(),
]));

// Preprocess state_transitions: accept single object, array, or null → always array
const StateTransitionsSchema = z.preprocess((val) => {
  if (val === null || val === undefined || val === 'null') return [];
  // If it's a single object (not array), wrap in array
  if (typeof val === 'object' && !Array.isArray(val)) {
    const obj = val as Record<string, unknown>;
    if (Object.keys(obj).length === 0) return [];
    // Normalize single transition object
    const from = obj.from || obj.current || obj.from_state;
    const to = obj.to || obj.next || obj.to_state;
    const misc_id = obj.misc_id || obj.miscId || obj.misconception_id || obj.id || '';
    const reason = obj.reason || obj.explanation || '';
    if (from && to && VALID_STATES.includes(from as string) && VALID_STATES.includes(to as string)) {
      return [{ misc_id: String(misc_id), from, to, reason: String(reason) }];
    }
    return [];
  }
  if (Array.isArray(val)) {
    return val.map((item: any) => {
      if (typeof item !== 'object' || item === null) return null;
      const from = item.from || item.current || item.from_state;
      const to = item.to || item.next || item.to_state;
      const misc_id = item.misc_id || item.miscId || item.misconception_id || item.id || '';
      const reason = item.reason || item.explanation || '';
      if (from && to && VALID_STATES.includes(from as string) && VALID_STATES.includes(to as string)) {
        return { misc_id: String(misc_id), from, to, reason: String(reason) };
      }
      return null;
    }).filter(Boolean);
  }
  return [];
}, z.array(z.object({
  misc_id: z.string(),
  from: z.enum(VALID_STATES_ENUM),
  to: z.enum(VALID_STATES_ENUM),
  reason: z.string().optional().default(''),
})).default([]));

export const GradeResultSchema = z.object({
  scores: z.object({
    framing: z.number().min(1).max(5),
    questions: z.number().min(1).max(5),
    reasoning: z.number().min(1).max(5),
    uncertainty: z.number().min(1).max(5),
    calibration: z.number().min(1).max(5),
  }),
  emoticon: z.enum(['delighted', 'happy', 'neutral', 'concerned', 'sad']),
  tag: z.string().transform(s => s.slice(0, 40)),
  evidence: z.string().transform(s => s.slice(0, 200)),
  state_transition: z.object({
    misc_id: z.string(),
    from: z.enum(['entrenched','aware','considering','updating','settled']),
    to: z.enum(['entrenched','aware','considering','updating','settled']),
    reason: z.string(),
  }).nullable(),
});

export const CoachResultSchema = z.object({
  nudge: z.string().min(1).max(800),
  trigger: z.string().transform((val): 'soft_nudge' | 'stuck' | 'reasoning_weak' | 'hint_request' | 'transfer_check' => {
    const valid = ['soft_nudge', 'stuck', 'reasoning_weak', 'hint_request', 'transfer_check'] as const;
    if (valid.includes(val as any)) return val as any;
    return 'stuck';
  }),
  intensity: z.string().transform((val): 'soft' | 'firm' | 'directive' => {
    const valid = ['soft', 'firm', 'directive'] as const;
    if (valid.includes(val as any)) return val as any;
    return 'firm';
  }),
});

export const PreteachResultSchema = z.object({
  concept_primer: z.string().min(1).transform(s => s.slice(0, 5000)),
  misconception_preview: z.string().min(1).transform(s => s.slice(0, 800)),
  strategy_options: z.array(z.string().transform(s => s.slice(0, 50))).length(4),
});

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
  reflection_check: z.string().optional(),
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

export const BriefGenerationSchema = z.object({
  subject: z.string(),
  scenario: z.string(),
  persona: z.object({
    name: z.string(),
    age: z.number().int().min(13).max(18),
    vibe: z.string(),
  }),
  misconceptions: z.array(z.object({
    id: z.string(),
    belief: z.string(),
    depth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    surface_when: z.string(),
    can_probe: z.boolean(),
  })).min(2).max(4),
  probe_claims: z.array(z.object({
    id: z.string(),
    claim: z.string(),
    truth: z.string(),
    context_hint: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
  })).min(1).max(3),
  trap_claims: z.array(z.object({
    id: z.string(),
    claim: z.string(),
    truth: z.string(),
    context_hint: z.string(),
  })).min(1).max(3),
  honest_topics: z.array(z.string()).min(2).max(5),
  objectives: z.array(z.string()).min(2).max(4),
  preteach_focus: z.string(),
});

export type BriefGeneration = z.infer<typeof BriefGenerationSchema>;

export type GradeResult = z.infer<typeof GradeResultSchema>;
export type CoachResult = z.infer<typeof CoachResultSchema>;
export type PreteachResult = z.infer<typeof PreteachResultSchema>;
export type AuditResult = z.infer<typeof AuditResultSchema>;
export type SynthesisResult = z.infer<typeof SynthesisResultSchema>;
