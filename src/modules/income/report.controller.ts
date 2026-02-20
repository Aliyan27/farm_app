import { Request, Response } from "express";
import { getIncomeStatementService } from "./reportsService";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { getCustomizedError } from "../../utils/UtilityFunctions";

export const getIncomeStatementController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { month, farm } = req.query;

    const result = await getIncomeStatementService({
      month: typeof month === "string" ? month : undefined,
      farm: typeof farm === "string" ? farm : undefined,
    });

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};
