import { Request, Response } from "express";
import {
  createSalaryService,
  getSalariesService,
  updateSalaryService,
  deleteSalaryService,
  getSalarySummaryService,
} from "./salariesService";
import {
  createSalarySchema,
  updateSalarySchema,
  salaryQuerySchema,
} from "./salaries.validation";
import { getCustomizedError } from "../../utils/UtilityFunctions";
import { AuthRequest } from "../../middlewares/authMiddleware";

export const createSalaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const data = createSalarySchema.parse(req.body);
    const result = await createSalaryService(data);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const getSalariesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const query = salaryQuerySchema.parse(req.query);
    const result = await getSalariesService(query);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const updateSalaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const data = updateSalarySchema.parse({ ...req.body, id });
    const result = await updateSalaryService(data);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const deleteSalaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const result = await deleteSalaryService(id);

    return res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const getSalarySummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { month, farm } = req.query;
    const result = await getSalarySummaryService(
      typeof month === "string" ? month : undefined,
      typeof farm === "string" ? farm : undefined,
    );

    return res.status(result.statusCode).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};
