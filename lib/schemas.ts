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
  emoticon: z.string().transform((val): 'delighted' | 'happy' | 'neutral' | 'concerned' | 'sad' => {
    const valid = ['delighted', 'happy', 'neutral', 'concerned', 'sad'] as const;
    if (valid.includes(val as any)) return val as any;
    if (/delight|excell|🎉|🌟|🎯/.test(val)) return 'delighted';
    if (/happy|good|👍|😊|positive/.test(val)) return 'happy';
    if (/concern|worry|😟|⚠/.test(val)) return 'concerned';
    if (/sad|poor|😢|bad/.test(val)) return 'sad';
    return 'neutral';
  }),
  tag: z.string().max(80),
  evidence: z.string(),
  // Accept both "state_transition" (single/null) and "state_transitions" (array) from LLM
  state_transitions: StateTransitionsSchema.optional().default([]),
  state_transition: StateTransitionSchema.optional(),
}).transform((val) => {
  // Merge: if LLM returned singular state_transition, add it to the array
  const transitions = [...(val.state_transitions || [])];
  if (val.state_transition) {
    const exists = transitions.some(t => t.misc_id === val.state_transition!.misc_id);
    if (!exists) transitions.push(val.state_transition);
  }
  return {
    scores: val.scores,
    emoticon: val.emoticon,
    tag: val.tag,
    evidence: val.evidence,
    state_transitions: transitions,
  };
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

// Brief generator output — what the LLM produces. id is added server-side after validation.
export const GeneratedBriefSchema = z.object({
  subject: z.string().min(3).max(120),
  scenario: z.string().min(10).max(400),
  persona: z.object({
    name: z.string().min(1).max(30),
    age: z.number().int().min(10).max(20),
    vibe: z.string().min(2).max(80),
  }),
  misconceptions: z.array(z.object({
    id: z.string().min(1).max(60),
    belief: z.string().min(5).max(300),
    depth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    surface_when: z.string().min(5).max(300),
    can_probe: z.boolean().optional().default(false),
  })).min(1).max(6),
  probe_claims: z.array(z.object({
    id: z.string().min(1).max(60),
    claim: z.string().min(5).max(300),
    truth: z.string().min(5).max(400),
    context_hint: z.string().min(3).max(300),
    difficulty: z.enum(['easy', 'medium', 'hard']),
  })).max(6).optional().default([]),
  trap_claims: z.array(z.object({
    id: z.string().min(1).max(60),
    claim: z.string().min(5).max(300),
    truth: z.string().min(5).max(400),
    context_hint: z.string().min(3).max(300),
  })).max(6).optional().default([]),
  honest_topics: z.array(z.string().min(3).max(200)).min(1).max(8),
  objectives: z.array(z.string().min(5).max(300)).min(1).max(6),
  preteach_focus: z.string().min(5).max(400),
});

export type GeneratedBrief = z.infer<typeof GeneratedBriefSchema>;

export type GradeResult = z.infer<typeof GradeResultSchema>;
export type CoachResult = z.infer<typeof CoachResultSchema>;
export type PreteachResult = z.infer<typeof PreteachResultSchema>;
export type AuditResult = z.infer<typeof AuditResultSchema>;
export type SynthesisResult = z.infer<typeof SynthesisResultSchema>;
