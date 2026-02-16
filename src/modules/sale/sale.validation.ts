import { z } from "zod";

export const createEggSaleSchema = z.object({
  saleDate: z.string().pipe(z.coerce.date()),
  month: z.string().length(3).optional(), // "Dec", "Jan", etc.
  challanNumber: z.string().optional(),
  farm: z.enum(["KAASI_19", "MATITAL", "COMBINED", "OTHER"]),
  amountReceived: z.number().positive(),
  description: z.string().min(1, "Description is required"),
  type: z.string().optional().default("Eggs"),
});

export const updateEggSaleSchema = createEggSaleSchema.partial().extend({
  id: z.number().int().positive(),
});

export const eggSaleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  farm: z.enum(["KAASI_19", "MATITAL", "COMBINED", "OTHER"]).optional(),
  month: z.string().length(3).optional(),
  startDate: z.string().pipe(z.coerce.date()).optional(),
  endDate: z.string().pipe(z.coerce.date()).optional(),
  search: z.string().optional(), // search description or challan
});
