import { z } from "zod";

// The JSON career sends to submit_extraction. The database checks the same shape and is the authority.
const skillList = z.array(z.string().trim().min(1, "Skill names cannot be empty.").max(80));

export const extractionPayloadSchema = z
  .object({
    skills: z
      .object({
        required: skillList,
        niceToHave: skillList,
      })
      .strict(),
    pay: z
      .object({
        minPhp: z.number().nonnegative().nullable().optional(),
        maxPhp: z.number().nonnegative().nullable().optional(),
      })
      .strict()
      .optional(),
    years: z.number().min(0).max(80).nullable().optional(),
    seniority: z.string().trim().max(80).nullable().optional(),
    engagement: z.string().trim().max(80).nullable().optional(),
    hiringVia: z.string().trim().max(80).nullable().optional(),
    needsInfo: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const min = value.pay?.minPhp;
    const max = value.pay?.maxPhp;
    if (min != null && max != null && min > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "pay.minPhp cannot be greater than pay.maxPhp.",
      });
    }
  });

export type ExtractionPayload = z.infer<typeof extractionPayloadSchema>;

export function parseExtractionPayload(input: unknown): ExtractionPayload {
  const parsed = extractionPayloadSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid extraction payload.");
  }
  return parsed.data;
}
