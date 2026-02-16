import { z } from "zod";

export const createFeedPurchaseSchema = z.object({
  date: z.string().pipe(z.coerce.date()),
  month: z.string().length(3).optional(),
  voucherType: z.enum(["IN", "OUT"]),
  feedType: z.string().min(1),
  farm: z.enum(["KAASI_19", "MATITAL", "COMBINED", "OTHER"]),
  bags: z.number().int().nonnegative(),
  description: z.string().optional(),
  debit: z.number().nonnegative().optional(),
  credit: z.number().nonnegative().optional(),
  reconciled: z.boolean().optional().default(false),
  postedToStatement: z.boolean().optional().default(false),
});

export const updateFeedPurchaseSchema = createFeedPurchaseSchema
  .partial()
  .extend({
    id: z.number().int().positive(),
  });

export const feedPurchaseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  farm: z.enum(["KAASI_19", "MATITAL", "COMBINED", "OTHER"]).optional(),
  month: z.string().length(3).optional(),
  voucherType: z.enum(["IN", "OUT"]).optional(),
  startDate: z.string().pipe(z.coerce.date()).optional(),
  endDate: z.string().pipe(z.coerce.date()).optional(),
  search: z.string().optional(),
  reconciled: z.enum(["true", "false"]).optional(),
});
