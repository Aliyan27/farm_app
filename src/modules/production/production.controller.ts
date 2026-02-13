import { Request, Response } from "express";
import {
  createEggProductionService,
  deleteEggProductionService,
  getEggProductionsService,
  getEggProductionSummaryService,
  updateEggProductionService,
} from "./productionService";
import {
  createEggProductionSchema,
  eggProductionQuerySchema,
  updateEggProductionSchema,
} from "./production.validation";
import { getCustomizedError } from "../../utils/UtilityFunctions";
import { AuthRequest } from "../../middlewares/authMiddleware";

export const createEggProductionController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const data = createEggProductionSchema.parse(req.body);
    const result = await createEggProductionService(data);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const getEggProductionsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const query = eggProductionQuerySchema.parse(req.query);
    const result = await getEggProductionsService(query);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
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
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { month, farm } = req.query;
    const result = await getEggProductionSummaryService(
      typeof month === "string" ? month : undefined,
      typeof farm === "string" ? farm : undefined,
    );

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const updateEggProductionController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id && req.user?.role === "admin")
      return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const data = updateEggProductionSchema.parse({
      ...req.body,
      id,
    });

    const result = await updateEggProductionService(data);

    return res.status(result.statusCode).json({
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

export const deleteEggProductionController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id && req.user?.role === "admin")
      return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const result = await deleteEggProductionService(id);

    return res.status(result.statusCode).json({
      message: result.message,
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};
