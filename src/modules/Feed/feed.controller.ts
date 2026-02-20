import { Request, Response } from "express";
import {
  createFeedPurchaseService,
  getFeedPurchasesService,
  updateFeedPurchaseService,
  deleteFeedPurchaseService,
  getFeedPurchaseSummaryService,
} from "./feedService";
import {
  createFeedPurchaseSchema,
  updateFeedPurchaseSchema,
  feedPurchaseQuerySchema,
} from "./feed.validation";
import { getCustomizedError } from "../../utils/UtilityFunctions";
import { AuthRequest } from "../../middlewares/authMiddleware";

/**
 * @swagger
 * tags:
 *   name: Feed Purchases
 *   description: Feed purchase and payment tracking endpoints
 */

/**
 * @swagger
 * /feed-purchases:
 *   post:
 *     summary: Record a new feed purchase or payment
 *     tags: [Feed Purchases]
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
 *               - voucherType
 *               - feedType
 *               - farm
 *               - bags
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-06T00:00:00.000Z"
 *               month:
 *                 type: string
 *                 example: "Dec"
 *               voucherType:
 *                 type: string
 *                 enum: [IN, OUT]
 *                 example: "OUT"
 *               feedType:
 *                 type: string
 *                 example: "13-C1"
 *               farm:
 *                 type: string
 *                 enum: [KAASI_19, MATITAL, COMBINED, OTHER]
 *                 example: "MATITAL"
 *               bags:
 *                 type: integer
 *                 minimum: 0
 *                 example: 240
 *               description:
 *                 type: string
 *                 example: "240 bags feed NO 13-C1 @6827/="
 *               debit:
 *                 type: number
 *                 minimum: 0
 *                 example: 1477862
 *               credit:
 *                 type: number
 *                 minimum: 0
 *                 example: 0
 *               reconciled:
 *                 type: boolean
 *                 default: false
 *               postedToStatement:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Feed purchase recorded
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
export const createFeedPurchaseController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const data = createFeedPurchaseSchema.parse(req.body);
    const result = await createFeedPurchaseService(data);

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
 * /feed-purchases:
 *   get:
 *     summary: Get list of feed purchases/payments (paginated & filtered)
 *     tags: [Feed Purchases]
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
 *         name: voucherType
 *         schema:
 *           type: string
 *           enum: [IN, OUT]
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
 *       - in: query
 *         name: reconciled
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Paginated list of feed purchases
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
export const getFeedPurchasesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const query = feedPurchaseQuerySchema.parse(req.query);
    const result = await getFeedPurchasesService(query);

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
 * /feed-purchases/{id}:
 *   put:
 *     summary: Update an existing feed purchase/payment
 *     tags: [Feed Purchases]
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
 *               voucherType:
 *                 type: string
 *                 enum: [IN, OUT]
 *               feedType:
 *                 type: string
 *               farm:
 *                 type: string
 *                 enum: [KAASI_19, MATITAL, COMBINED, OTHER]
 *               bags:
 *                 type: integer
 *               description:
 *                 type: string
 *               debit:
 *                 type: number
 *               credit:
 *                 type: number
 *               reconciled:
 *                 type: boolean
 *               postedToStatement:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feed purchase updated
 *       400:
 *         description: Invalid ID or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Feed purchase not found
 */
export const updateFeedPurchaseController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const data = updateFeedPurchaseSchema.parse({ ...req.body, id });
    const result = await updateFeedPurchaseService(data);

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
 * /feed-purchases/{id}:
 *   delete:
 *     summary: Delete a feed purchase/payment record
 *     tags: [Feed Purchases]
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
 *         description: Feed purchase deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Feed purchase not found
 */
export const deleteFeedPurchaseController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const result = await deleteFeedPurchaseService(id);

    return res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

/**
 * @swagger
 * /feed-purchases/summary:
 *   get:
 *     summary: Get feed purchase/payment summary
 *     tags: [Feed Purchases]
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
 *         description: Summary of totals and balance
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
 *                     totalDebit:
 *                       type: number
 *                     totalCredit:
 *                       type: number
 *                     totalBags:
 *                       type: number
 *                     currentBalance:
 *                       type: number
 *                     byFarm:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
export const getFeedPurchaseSummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { month, farm } = req.query;
    const result = await getFeedPurchaseSummaryService(
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
