import { z } from 'zod';

export const GradeResultSchema = z.object({
  scores: z.object({
    framing: z.number().min(1).max(5),
    questions: z.number().min(1).max(5),
    reasoning: z.number().min(1).max(5),
    uncertainty: z.number().min(1).max(5),
    calibration: z.number().min(1).max(5),
  }),
  emoticon: z.enum(['delighted', 'happy', 'neutral', 'concerned', 'sad']),
  tag: z.string().max(40),
  evidence: z.string().max(200),
  state_transition: z.object({
    misc_id: z.string(),
    from: z.enum(['entrenched','aware','considering','updating','settled']),
    to: z.enum(['entrenched','aware','considering','updating','settled']),
    reason: z.string(),
  }).nullable(),
});

export const CoachResultSchema = z.object({
  nudge: z.string().min(1).max(400),
  type: z.enum(['stuck', 'hint_request', 'transfer_check']),
});

export const PreteachResultSchema = z.object({
  concept_primer: z.string().min(50).max(1500),
  misconception_preview: z.string().min(30).max(800),
  strategy_options: z.array(z.string().max(50)).length(4),
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
