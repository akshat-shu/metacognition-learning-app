import { z } from "zod";

export const AuditResultSchema = z.object({
  approve: z.boolean(),
  reason: z.string(),
});

export const GradeResultSchema = z.object({
  scores: z.object({
    framing: z.number().min(1).max(5),
    questions: z.number().min(1).max(5),
    reasoning: z.number().min(1).max(5),
    uncertainty: z.number().min(1).max(5),
  }),
  emoticon: z.enum(["delighted", "happy", "neutral", "concerned", "sad"]),
  tag: z.string().max(40),
  evidence: z.string().max(200),
});

export const SynthResultSchema = z.object({
  moments: z.array(
    z.object({
      turn_index: z.number(),
      type: z.enum(["breakthrough", "missed_opportunity", "pivot", "stumble"]),
      summary: z.string(),
      why_it_mattered: z.string(),
      try_next_time: z.string(),
    }),
  ),
  summary: z.object({
    averages: z.object({
      framing: z.number(),
      questions: z.number(),
      reasoning: z.number(),
      uncertainty: z.number(),
    }),
    trend: z.enum(["improving", "flat", "declining"]),
    takeaway: z.string(),
  }),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;
export type GradeResult = z.infer<typeof GradeResultSchema>;
export type SynthResult = z.infer<typeof SynthResultSchema>;
