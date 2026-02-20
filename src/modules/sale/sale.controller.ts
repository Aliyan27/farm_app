import { Request, Response } from "express";
import {
  createEggSaleService,
  getEggSalesService,
  updateEggSaleService,
  deleteEggSaleService,
  getEggSaleSummaryService,
} from "./saleService";
import {
  createEggSaleSchema,
  updateEggSaleSchema,
  eggSaleQuerySchema,
} from "./sale.validation";
import { getCustomizedError } from "../../utils/UtilityFunctions";
import { AuthRequest } from "../../middlewares/authMiddleware";

/**
 * @swagger
 * tags:
 *   name: Egg Sales
 *   description: Egg sales revenue tracking endpoints
 */

/**
 * @swagger
 * /egg-sales:
 *   post:
 *     summary: Record a new egg sale
 *     tags: [Egg Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saleDate
 *               - farm
 *               - amountReceived
 *               - description
 *             properties:
 *               saleDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-01T00:00:00.000Z"
 *               month:
 *                 type: string
 *                 example: "Dec"
 *               challanNumber:
 *                 type: string
 *                 example: "1031"
 *               farm:
 *                 type: string
 *                 enum: [KAASI_19, MATITAL, COMBINED, OTHER]
 *                 example: "KAASI_19"
 *               amountReceived:
 *                 type: number
 *                 minimum: 0
 *                 example: 16900
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 example: "2p6c @ 5500"
 *               type:
 *                 type: string
 *                 example: "Eggs"
 *     responses:
 *       201:
 *         description: Egg sale recorded
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
 *         description: Validation error (missing required fields)
 *       401:
 *         description: Unauthorized
 */
export const createEggSaleController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const data = createEggSaleSchema.parse(req.body);
    const result = await createEggSaleService(data);

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
 * /egg-sales:
 *   get:
 *     summary: Get paginated list of egg sales
 *     tags: [Egg Sales]
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
 *           description: Search in description or challanNumber
 *     responses:
 *       200:
 *         description: Paginated list of egg sales
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
export const getEggSalesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const query = eggSaleQuerySchema.parse(req.query);
    const result = await getEggSalesService(query);

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
 * /egg-sales/{id}:
 *   put:
 *     summary: Update an existing egg sale record
 *     tags: [Egg Sales]
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
 *               saleDate:
 *                 type: string
 *                 format: date-time
 *               month:
 *                 type: string
 *               challanNumber:
 *                 type: string
 *               farm:
 *                 type: string
 *                 enum: [KAASI_19, MATITAL, COMBINED, OTHER]
 *               amountReceived:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Egg sale record updated
 *       400:
 *         description: Invalid ID or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
export const updateEggSaleController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const data = updateEggSaleSchema.parse({ ...req.body, id });
    const result = await updateEggSaleService(data);

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
 * /egg-sales/{id}:
 *   delete:
 *     summary: Delete an egg sale record
 *     tags: [Egg Sales]
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
 *         description: Egg sale record deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
export const deleteEggSaleController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const result = await deleteEggSaleService(id);

    return res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

/**
 * @swagger
 * /egg-sales/summary:
 *   get:
 *     summary: Get egg sales summary (totals by farm/month)
 *     tags: [Egg Sales]
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
 *         description: Sales summary
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
 *                     totalAmount:
 *                       type: number
 *                     byFarm:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
export const getEggSaleSummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { month, farm } = req.query;
    const result = await getEggSaleSummaryService(
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
