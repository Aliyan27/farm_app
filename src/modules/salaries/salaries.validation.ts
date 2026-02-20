import { z } from "zod";

export const createSalarySchema = z.object({
  month: z.string().min(3).max(20),
  employeeName: z.string().min(1),
  designation: z.string().min(1),
  farm: z.enum(["KAASI_19", "MATITAL", "COMBINED", "OTHER"]).optional(),
  attendance: z.number().int().min(0).max(31).optional(),
  basicSalary: z.number().nonnegative().optional(),
  salaryAmount: z.number().nonnegative(),
  advance: z.number().nonnegative().optional(),
  penaltyReward: z.number().optional(),
  total: z.number().nonnegative(),
  remarks: z.string().optional(),
});

export const updateSalarySchema = createSalarySchema.partial().extend({
  id: z.number().int().positive(),
});

export const salaryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  month: z.string().optional(),
  farm: z
    .enum(["KAASI_19", "MATITAL", "COMBINED", "OTHER", "MANAGEMENT"])
    .optional(),
  search: z.string().optional(),
});
