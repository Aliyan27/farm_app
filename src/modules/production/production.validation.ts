import { z } from "zod";

export const createEggProductionSchema = z.object({
  date: z.string().pipe(z.coerce.date()),
  month: z.string().length(3).optional(), // "Dec", "Jan", etc.
  farm: z.enum(["KAASI_19", "MATITAL", "COMBINED", "OTHER"]),
  chickenEggs: z.number().int().nonnegative(),
  totalEggs: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const updateEggProductionSchema = createEggProductionSchema
  .partial()
  .extend({
    id: z.number().int().positive(),
  });

export const eggProductionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  farm: z.enum(["KAASI_19", "MATITAL", "COMBINED", "OTHER"]).optional(),
  month: z.string().length(3).optional(),
  startDate: z.string().pipe(z.coerce.date()).optional(),
  endDate: z.string().pipe(z.coerce.date()).optional(),
  search: z.string().optional(),
});
