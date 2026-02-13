// expense.validation.ts
import { z } from "zod";

export const EXPENSE_HEADS = [
  "CHICKEN",
  "FEED",
  "RENT",
  "UTILITIES",
  "PACKING_MATERIAL",
  "TP",
  "SALARIES_PAYMENTS",
  "MESS",
  "POWER_ELECTRIC",
  "POL",
  "MEDICINE",
  "VACCINE",
  "REPAIR_MAINTENANCE",
  "TRAVELLING_LOGISTICS",
  "OFFICE_EXPENSES",
  "MEETING_REFRESHMENT",
  "FURNITURE_FIXTURE",
  "COMPUTER_DEVICES",
  "PROFESSIONAL_FEE",
  "MISCELLANEOUS",
  "SHAREHOLDERS_DIVIDEND",
  "OTHER",
] as const;

export const createExpenseSchema = z.object({
  expenseDate: z.string().pipe(z.coerce.date()),
  month: z.string().min(3).max(3).optional(),
  challan: z.string().optional(),
  transId: z.string().optional(),
  farm: z.enum(["MATITAL", "KAASI_19", "OTHER"]),
  expenseCost: z.number().positive(),
  head: z.enum(EXPENSE_HEADS),
  notes: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.number().int().positive(),
});

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  farm: z.enum(["MATITAL", "KAASI_19", "OTHER"]).optional(),
  head: z.enum(EXPENSE_HEADS).optional(),
  month: z.string().min(3).max(3).optional(),
  startDate: z.string().pipe(z.coerce.date()).optional(),
  endDate: z.string().pipe(z.coerce.date()).optional(),
  search: z.string().optional(),
  cancelled: z.enum(["true", "false"]).optional(), // future filter
});
