import prisma from "../../utils/Prisma";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} from "./expense.validation";
import z from "zod";

type CreateInput = z.infer<typeof createExpenseSchema>;
type UpdateInput = z.infer<typeof updateExpenseSchema>;
type QueryInput = z.infer<typeof expenseQuerySchema>;

interface ServiceResponse<T = any> {
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
        date: data.date,
        farm: data.farm,
        category: data.category,
        challanId: data.challanId,
        amount: data.amount,
        costPerHead: data.costPerHead,
        description: data.description,
      },
    });

    return {
      statusCode: 201,
      message: "Expense created successfully",
      data: expense,
    };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { statusCode: 409, message: "Duplicate entry", data: null };
    }
    return { statusCode: 500, message: "Failed to create expense", data: null };
  }
};

export const getExpensesService = async (
  query: QueryInput,
): Promise<ServiceResponse> => {
  const { page, limit, ...filters } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.farm) where.farm = filters.farm;
  if (filters.category) where.category = filters.category;
  if (filters.month) {
    const [year, month] = filters.month.split("-");
    where.date = {
      gte: new Date(Number(year), Number(month) - 1, 1),
      lt: new Date(Number(year), Number(month), 1),
    };
  }
  if (filters.startDate) where.date = { ...where.date, gte: filters.startDate };
  if (filters.endDate) where.date = { ...where.date, lte: filters.endDate };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    statusCode: 200,
    message: "Expenses retrieved",
    data: {
      items: expenses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  };
};

export const updateExpenseService = async (
  data: UpdateInput,
): Promise<ServiceResponse> => {
  try {
    const expense = await prisma.expense.update({
      where: { id: data.id },
      data: {
        date: data.date,
        farm: data.farm,
        category: data.category,
        challanId: data.challanId,
        amount: data.amount,
        costPerHead: data.costPerHead,
        description: data.description,
      },
    });

    return {
      statusCode: 200,
      message: "Expense updated",
      data: expense,
    };
  } catch (err: any) {
    return { statusCode: 500, message: "Failed to update expense", data: null };
  }
};

export const deleteExpenseService = async (
  id: number,
): Promise<ServiceResponse> => {
  try {
    await prisma.expense.delete({ where: { id } });
    return { statusCode: 200, message: "Expense deleted", data: null };
  } catch (err: any) {
    return { statusCode: 500, message: "Failed to delete expense", data: null };
  }
};

// Bonus: simple monthly summary (can be expanded later)
export const getExpenseSummaryService = async (
  month: string,
): Promise<ServiceResponse> => {
  const [year, mon] = month.split("-");
  const start = new Date(Number(year), Number(mon) - 1, 1);
  const end = new Date(Number(year), Number(mon), 1);

  const summary = await prisma.expense.groupBy({
    by: ["farm", "category"],
    where: { date: { gte: start, lt: end } },
    _sum: { amount: true, costPerHead: true },
  });

  const total = await prisma.expense.aggregate({
    where: { date: { gte: start, lt: end } },
    _sum: { amount: true },
  });

  return {
    statusCode: 200,
    message: "Monthly expense summary",
    data: { byGroup: summary, total: total._sum.amount ?? 0 },
  };
};
