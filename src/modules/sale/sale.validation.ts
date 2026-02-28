import { z } from "zod";

export const createEggSaleSchema = z.object({
  saleDate: z.string().datetime({ message: "Invalid date format" }),
  challanNumber: z.string().optional(),
  farm: z.enum(["KAASI_19", "MATITAL", "OTHER"]),
  eggsSold: z.number().int().min(0, "Eggs sold cannot be negative"),
  pricePerEgg: z.number().min(0, "Price cannot be negative").optional(),
  amountReceived: z.number().min(0, "Amount received cannot be negative"),
  notes: z.string().min(1, "Description is required"),
  type: z.string().optional().default("Eggs"),
  totalAmount: z.number().optional(),
  paymentDue: z.number().optional(),
});

export const updateEggSaleSchema = createEggSaleSchema.partial().extend({
  id: z.number().int().positive(),
});

export const eggSaleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  farm: z.enum(["KAASI_19", "MATITAL", "OTHER"]).optional(),
  startDate: z.string().pipe(z.coerce.date()).optional(),
  endDate: z.string().pipe(z.coerce.date()).optional(),
  search: z.string().optional(),
});
