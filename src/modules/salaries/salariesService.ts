import { z } from "zod";
import prisma from "../../utils/Prisma";
import {
  createSalarySchema,
  updateSalarySchema,
  salaryQuerySchema,
} from "./salaries.validation";

type CreateInput = z.infer<typeof createSalarySchema>;
type UpdateInput = z.infer<typeof updateSalarySchema>;
type QueryInput = z.infer<typeof salaryQuerySchema>;

export interface ServiceResponse<T = any> {
  statusCode: number;
  message: string;
  data: T | null;
}

export const createSalaryService = async (
  data: CreateInput,
): Promise<ServiceResponse> => {
  try {
    const salary = await prisma.salary.create({
      data: {
        month: data.month,
        employeeName: data.employeeName,
        designation: data.designation,
        farm: data.farm,
        attendance: data.attendance,
        basicSalary: data.basicSalary,
        salaryAmount: data.salaryAmount,
        advance: data.advance,
        penaltyReward: data.penaltyReward,
        total: data.total,
        remarks: data.remarks,
      },
    });

    return {
      statusCode: 201,
      message: "Salary record created successfully",
      data: salary,
    };
  } catch (err: any) {
    console.error("[createSalaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to create salary record",
      data: null,
    };
  }
};

export const getSalariesService = async (
  query: QueryInput,
): Promise<ServiceResponse> => {
  const { page, limit, search, ...filters } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.month) where.month = filters.month;
  if (filters.farm) where.farm = filters.farm;

  if (search) {
    where.OR = [
      { employeeName: { contains: search, mode: "insensitive" } },
      { designation: { contains: search, mode: "insensitive" } },
      { remarks: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [salaries, total] = await Promise.all([
      prisma.salary.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ month: "desc" }, { employeeName: "asc" }],
      }),
      prisma.salary.count({ where }),
    ]);

    return {
      statusCode: 200,
      message: "Salary records retrieved",
      data: {
        items: salaries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (err: any) {
    console.error("[getSalariesService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to fetch salary records",
      data: null,
    };
  }
};

export const updateSalaryService = async (
  data: UpdateInput,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.salary.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Salary record not found",
        data: null,
      };
    }

    const updated = await prisma.salary.update({
      where: { id: data.id },
      data: {
        month: data.month,
        employeeName: data.employeeName,
        designation: data.designation,
        farm: data.farm,
        attendance: data.attendance,
        basicSalary: data.basicSalary,
        salaryAmount: data.salaryAmount,
        advance: data.advance,
        penaltyReward: data.penaltyReward,
        total: data.total,
        remarks: data.remarks,
      },
    });

    return {
      statusCode: 200,
      message: "Salary record updated successfully",
      data: updated,
    };
  } catch (err: any) {
    console.error("[updateSalaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to update salary record",
      data: null,
    };
  }
};

export const deleteSalaryService = async (
  id: number,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.salary.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Salary record not found",
        data: null,
      };
    }

    await prisma.salary.delete({ where: { id } });

    return {
      statusCode: 200,
      message: "Salary record deleted successfully",
      data: null,
    };
  } catch (err: any) {
    console.error("[deleteSalaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to delete salary record",
      data: null,
    };
  }
};

export const getSalarySummaryService = async (
  month?: string,
  farm?: string,
): Promise<ServiceResponse> => {
  const where: any = {};

  if (month) where.month = month;
  if (farm) where.farm = farm;

  try {
    const byFarm = await prisma.salary.groupBy({
      by: ["farm"],
      where,
      _sum: { total: true, advance: true, salaryAmount: true },
    });

    const total = await prisma.salary.aggregate({
      where,
      _sum: { total: true, advance: true, salaryAmount: true },
    });

    return {
      statusCode: 200,
      message: "Salary summary generated",
      data: {
        totalPaid: total._sum.total ?? 0,
        totalAdvance: total._sum.advance ?? 0,
        totalSalaryAmount: total._sum.salaryAmount ?? 0,
        byFarm,
      },
    };
  } catch (err: any) {
    console.error("[getSalarySummaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate summary",
      data: null,
    };
  }
};
