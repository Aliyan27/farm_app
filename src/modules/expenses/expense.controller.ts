import { Request, Response } from "express";
import {
  createExpenseService,
  getExpensesService,
  updateExpenseService,
  deleteExpenseService,
  getExpenseSummaryService,
} from "./expenseService";
import { createExpenseSchema, updateExpenseSchema } from "./expense.validation";
import { getCustomizedError } from "../../utils/UtilityFunctions";
import { AuthRequest } from "../../middlewares/authMiddleware";

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management endpoints
 */

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense entry
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expenseDate
 *               - expenseCost
 *               - head
 *               - farm
 *             properties:
 *               expenseDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-01T00:00:00.000Z"
 *               challan:
 *                 type: string
 *                 example: "748"
 *               transId:
 *                 type: string
 *                 example: "Arafat Adeel"
 *               farm:
 *                 type: string
 *                 enum: [MATITAL, KAASI_19, OTHER]
 *               expenseCost:
 *                 type: number
 *                 minimum: 0
 *                 example: 105600
 *               head:
 *                 type: string
 *                 enum:
 *                   - CHICKEN
 *                   - FEED
 *                   - RENT
 *                   - UTILITIES
 *                   - PACKING_MATERIAL
 *                   - TP
 *                   - SALARIES_PAYMENTS
 *                   - MESS
 *                   - POWER_ELECTRIC
 *                   - POL
 *                   - MEDICINE
 *                   - VACCINE
 *                   - REPAIR_MAINTENANCE
 *                   - TRAVELLING_LOGISTICS
 *                   - OFFICE_EXPENSES
 *                   - MEETING_REFRESHMENT
 *                   - FURNITURE_FIXTURE
 *                   - COMPUTER_DEVICES
 *                   - PROFESSIONAL_FEE
 *                   - MISCELLANEOUS
 *                   - SHAREHOLDERS_DIVIDEND
 *                   - OTHER
 *               notes:
 *                 type: string
 *                 example: "Cancel"
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const createExpenseController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

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

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get paginated list of expenses (filtered by farm & date range)
 *     tags: [Expenses]
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
 *           enum: [MATITAL, KAASI_19, OTHER]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Paginated list of expenses
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
export const getExpensesController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { page = 1, limit = 50, farm, startDate, endDate } = req.query;

    const result = await getExpensesService(
      Number(page),
      Number(limit),
      typeof farm === "string" ? farm : undefined,
      typeof startDate === "string" ? startDate : undefined,
      typeof endDate === "string" ? endDate : undefined,
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
 * /expenses/{id}:
 *   put:
 *     summary: Update an existing expense
 *     tags: [Expenses]
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
 *               expenseDate:
 *                 type: string
 *                 format: date-time
 *               challan:
 *                 type: string
 *               transId:
 *                 type: string
 *               farm:
 *                 type: string
 *                 enum: [MATITAL, KAASI_19, OTHER]
 *               expenseCost:
 *                 type: number
 *               head:
 *                 type: string
 *                 enum: [CHICKEN, FEED, ...]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated
 *       400:
 *         description: Invalid ID or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 */
export const updateExpenseController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

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

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Delete an expense entry
 *     tags: [Expenses]
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
 *         description: Expense deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 */
export const deleteExpenseController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const id = Number(req.params.id);
    const result = await deleteExpenseService(id);

    return res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};

/**
 * @swagger
 * /expenses/summary:
 *   get:
 *     summary: Get expense summary (total + breakdown by head & farm)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farm
 *         schema:
 *           type: string
 *           enum: [MATITAL, KAASI_19, OTHER]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Expense summary
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
 *                     total:
 *                       type: number
 *                     byHead:
 *                       type: array
 *                       items:
 *                         type: object
 *                     byFarm:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
export const getExpenseSummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { farm, startDate, endDate } = req.query;

    const result = await getExpenseSummaryService(
      typeof farm === "string" ? farm : undefined,
      typeof startDate === "string" ? startDate : undefined,
      typeof endDate === "string" ? endDate : undefined,
    );

    return res.status(result.statusCode).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return getCustomizedError(error, res);
  }
};
