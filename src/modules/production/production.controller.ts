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

/**
 * @swagger
 * tags:
 *   name: Egg Production
 *   description: Daily egg production recording and reporting
 */

/**
 * @swagger
 * /egg-productions:
 *   post:
 *     summary: Record daily egg production
 *     tags: [Egg Production]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - farm
 *               - chickenEggs
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-01T00:00:00.000Z"
 *               month:
 *                 type: string
 *                 example: "Dec"
 *               farm:
 *                 type: string
 *                 enum: [KAASI_19, MATITAL, COMBINED, OTHER]
 *                 example: "KAASI_19"
 *               chickenEggs:
 *                 type: integer
 *                 minimum: 0
 *                 example: 13290
 *               totalEggs:
 *                 type: integer
 *                 minimum: 0
 *                 example: 13290
 *               notes:
 *                 type: string
 *                 example: "Normal production day"
 *     responses:
 *       201:
 *         description: Production record created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /egg-productions:
 *   get:
 *     summary: Get paginated list of egg production records
 *     tags: [Egg Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: farm
 *         schema:
 *           type: string
 *           enum: [KAASI_19, MATITAL, COMBINED, OTHER]
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: Dec
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of production records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid query parameters
 */
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

/**
 * @swagger
 * /egg-productions/summary:
 *   get:
 *     summary: Get egg production summary (totals by farm/month)
 *     tags: [Egg Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: Dec
 *       - in: query
 *         name: farm
 *         schema:
 *           type: string
 *           enum: [KAASI_19, MATITAL, COMBINED, OTHER]
 *     responses:
 *       200:
 *         description: Production summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEggs:
 *                       type: number
 *                     byFarm:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /egg-productions/{id}:
 *   put:
 *     summary: Update an existing egg production record
 *     tags: [Egg Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               month:
 *                 type: string
 *               farm:
 *                 type: string
 *                 enum: [KAASI_19, MATITAL, COMBINED, OTHER]
 *               chickenEggs:
 *                 type: integer
 *                 minimum: 0
 *               totalEggs:
 *                 type: integer
 *                 minimum: 0
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Production record updated
 *       400:
 *         description: Invalid ID or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
export const updateEggProductionController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id || req.user?.role !== "admin")
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

/**
 * @swagger
 * /egg-productions/{id}:
 *   delete:
 *     summary: Delete an egg production record
 *     tags: [Egg Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Production record deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
export const deleteEggProductionController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id || req.user?.role !== "admin")
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
