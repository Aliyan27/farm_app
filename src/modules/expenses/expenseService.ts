import { z } from "zod";
import prisma from "../../utils/Prisma";
import { createExpenseSchema, updateExpenseSchema } from "./expense.validation";

type CreateInput = z.infer<typeof createExpenseSchema>;
type UpdateInput = z.infer<typeof updateExpenseSchema>;

export interface ServiceResponse<T = any> {
  statusCode: number;
  message: string;
  data: T | null;
}

export const createExpenseService = async (
  data: CreateInput,
): Promise<ServiceResponse> => {
  try {
    const expense = await prisma.expense.create({
      data: {
        expenseDate: data.expenseDate,
        challan: data.challan,
        transId: data.transId,
        farm: data.farm,
        expenseCost: data.expenseCost,
        head: data.head,
        notes: data.notes,
      },
    });

    return {
      statusCode: 201,
      message: "success",
      data: expense,
    };
  } catch (err: any) {
    console.error("[createExpenseService] Error:", err);

    if (err.code === "P2002") {
      return {
        statusCode: 409,
        message: "Duplicate expense entry",
        data: null,
      };
    }

    return {
      statusCode: 500,
      message: "Failed to create expense",
      data: null,
    };
  }
};

export const getExpensesService = async (
  page: number,
  limit: number,
  farm?: string,
  startDate?: string,
  endDate?: string,
): Promise<ServiceResponse> => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (farm) where.farm = farm;

  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) where.expenseDate.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      where.expenseDate.lt = end;
    }
  }

  try {
    const expenses = await prisma.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ expenseDate: "desc" }, { id: "desc" }],
    });

    const total = await prisma.expense.count({ where });

    return {
      statusCode: 200,
      message: "success",
      data: {
        items: expenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (err: any) {
    console.error("[getExpensesService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to fetch expenses",
      data: null,
    };
  }
};

export const updateExpenseService = async (
  data: UpdateInput,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.expense.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Expense not found",
        data: null,
      };
    }

    const updated = await prisma.expense.update({
      where: { id: data.id },
      data: {
        expenseDate: data.expenseDate,
        challan: data.challan,
        transId: data.transId,
        farm: data.farm,
        expenseCost: data.expenseCost,
        head: data.head,
        notes: data.notes,
      },
    });

    return {
      statusCode: 200,
      message: "success",
      data: updated,
    };
  } catch (err: any) {
    console.error("[updateExpenseService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to update expense",
      data: null,
    };
  }
};

export const deleteExpenseService = async (
  id: number,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Expense not found",
        data: null,
      };
    }

    await prisma.expense.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      message: "success",
      data: null,
    };
  } catch (err: any) {
    console.error("[deleteExpenseService] Error:", err);

    if (err.code === "P2025") {
      return {
        statusCode: 404,
        message: "Expense not found",
        data: null,
      };
    }

    return {
      statusCode: 500,
      message: "Failed to delete expense",
      data: null,
    };
  }
};

export const getExpenseSummaryService = async (
  farm?: string,
  startDate?: string,
  endDate?: string,
): Promise<ServiceResponse> => {
  const where: any = {};

  if (farm) where.farm = farm;

  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) where.expenseDate.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      where.expenseDate.lt = end;
    }
  }

  try {
    const byHead = await prisma.expense.groupBy({
      by: ["head"],
      where,
      _sum: { expenseCost: true },
      orderBy: { _sum: { expenseCost: "desc" } },
    });

    const byFarm = await prisma.expense.groupBy({
      by: ["farm"],
      where,
      _sum: { expenseCost: true },
    });

    const total = await prisma.expense.aggregate({
      where,
      _sum: { expenseCost: true },
    });

    const totalCost = total._sum?.expenseCost ?? 0;

    return {
      statusCode: 200,
      message: "success",
      data: {
        total: totalCost,
        byHead,
        byFarm,
      },
    };
  } catch (err: any) {
    console.error("[getExpenseSummaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate summary",
      data: null,
    };
  }
};
