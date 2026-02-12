import { z } from "zod";

export const createExpenseSchema = z.object({
  date: z.string().pipe(z.coerce.date()),
  farm: z.enum(["KAASI_19", "MATITAL_I", "MATITAL_II", "COMBINED", "OTHER"]),
  category: z.enum([
    "FEED",
    "UTILITIES",
    "RENT",
    "POWER_ELECTRIC",
    "TRANSPORT",
    "LABOR",
    "VETERINARY",
    "MAINTENANCE",
    "OFFICE",
    "OTHER",
  ]),
  challanId: z.string().optional(),
  amount: z.number().positive(),
  costPerHead: z.number().positive().optional(),
  description: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.number().int().positive(),
});

export const EXPENSE_CATEGORIES = [
  "FEED",
  "UTILITIES",
  "RENT",
  "POWER_ELECTRIC",
  "TRANSPORT",
  "LABOR",
  "VETERINARY",
  "MAINTENANCE",
  "OFFICE",
  "OTHER",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  farm: z
    .enum(["KAASI_19", "MATITAL_I", "MATITAL_II", "COMBINED", "OTHER"])
    .optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional(), // ← fixed here
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  startDate: z.string().pipe(z.coerce.date()).optional(),
  endDate: z.string().pipe(z.coerce.date()).optional(),
});
