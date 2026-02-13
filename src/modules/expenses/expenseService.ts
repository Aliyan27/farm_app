import { z } from "zod";
import prisma from "../../utils/Prisma";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} from "./expense.validation";

type CreateInput = z.infer<typeof createExpenseSchema>;
type UpdateInput = z.infer<typeof updateExpenseSchema>;
type QueryInput = z.infer<typeof expenseQuerySchema>;

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
        month: data.month,
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
      message: "Expense recorded successfully",
      data: expense,
    };
  } catch (err: any) {
    console.error("[createExpenseService] Error:", err);

    if (err.code === "P2002") {
      return {
        statusCode: 409,
        message: "Duplicate expense entry (unique constraint violation)",
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
  query: QueryInput,
): Promise<ServiceResponse> => {
  const { page, limit, search, cancelled, ...filters } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.farm) where.farm = filters.farm;
  if (filters.head) where.head = filters.head;
  if (filters.month) where.month = filters.month;

  if (filters.startDate || filters.endDate) {
    where.expenseDate = {};
    if (filters.startDate) where.expenseDate.gte = filters.startDate;
    if (filters.endDate) where.expenseDate.lte = filters.endDate;
  }

  if (search) {
    where.OR = [
      { notes: { contains: search, mode: "insensitive" } },
      { challan: { contains: search, mode: "insensitive" } },
      { transId: { contains: search, mode: "insensitive" } },
    ];
  }

  if (cancelled === "true") {
    where.notes = { contains: "Cancel", mode: "insensitive" };
  } else if (cancelled === "false") {
    where.notes = { not: { contains: "Cancel", mode: "insensitive" } };
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
      message: "Expenses retrieved",
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
        month: data.month,
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
      message: "Expense updated successfully",
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
      message: "Expense deleted successfully",
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
  month?: string,
  farm?: string,
): Promise<ServiceResponse> => {
  const where: any = {};

  if (month) where.month = month;
  if (farm) where.farm = farm;

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
      message: "Expense summary generated",
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
