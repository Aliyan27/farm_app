import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { z } from "zod";
import { getCustomizedError } from "../../utils/UtilityFunctions";
import {
  getExpenseSummaryService,
  getEggProductionSummaryService,
  getEggSaleSummaryService,
  getFeedPurchaseSummaryService,
} from "./dashboardService";

const reportQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format (YYYY-MM-DD)")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format (YYYY-MM-DD)")
    .optional(),
  farm: z.enum(["KAASI_19", "MATITAL", "COMBINED", "OTHER"]).optional(),
});

export const getExpenseSummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const query = reportQuerySchema.parse(req.query);

    const result = await getExpenseSummaryService(
      query.farm,
      query.startDate,
      query.endDate,
    );

    return res.status(result.statusCode).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const getEggProductionSummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const query = reportQuerySchema.parse(req.query);

    const result = await getEggProductionSummaryService(
      query.farm,
      query.startDate,
      query.endDate,
    );

    return res.status(result.statusCode).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const getEggSaleSummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const query = reportQuerySchema.parse(req.query);

    const result = await getEggSaleSummaryService(
      query.farm,
      query.startDate,
      query.endDate,
    );

    return res.status(result.statusCode).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const getFeedPurchaseSummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const query = reportQuerySchema.parse(req.query);

    const result = await getFeedPurchaseSummaryService(
      query.farm,
      query.startDate,
      query.endDate,
    );

    return res.status(result.statusCode).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};
