import { Request, Response } from "express";
import {
  createExpenseService,
  getExpensesService,
  updateExpenseService,
  deleteExpenseService,
  getExpenseSummaryService,
} from "./expenseService";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} from "./expense.validation";
import { getCustomizedError } from "../../utils/UtilityFunctions";
import { AuthRequest } from "../../middlewares/authMiddleware";

export const createExpenseController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id && req.user?.role === "admin")
      return res.status(401).json({ error: "Unauthorized" });

    const data = createExpenseSchema.parse(req.body);
    const result = await createExpenseService(data);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const getExpensesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const query = expenseQuerySchema.parse(req.query);
    const result = await getExpensesService(query);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const updateExpenseController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id && req.user?.role === "admin")
      return res.status(401).json({ error: "Unauthorized" });

    const data = updateExpenseSchema.parse({
      ...req.body,
      id: Number(req.params.id),
    });
    const result = await updateExpenseService(data);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const deleteExpenseController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id && req.user?.role === "admin")
      return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    const result = await deleteExpenseService(id);

    return res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const getExpenseSummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { month } = req.query;
    if (typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: "Invalid month format (YYYY-MM)" });
    }

    const result = await getExpenseSummaryService(month);
    return res.status(result.statusCode).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};
