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

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management endpoints (create, list, update, delete, summary)
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
 *               month:
 *                 type: string
 *                 example: "Dec"
 *                 minLength: 3
 *                 maxLength: 3
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
 *     summary: Get list of expenses (paginated & filtered)
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
 *         name: head
 *         schema:
 *           type: string
 *           enum:
 *             - CHICKEN
 *             - FEED
 *             - RENT
 *             - UTILITIES
 *             - PACKING_MATERIAL
 *             - TP
 *             - SALARIES_PAYMENTS
 *             - MESS
 *             - POWER_ELECTRIC
 *             - POL
 *             - MEDICINE
 *             - VACCINE
 *             - REPAIR_MAINTENANCE
 *             - TRAVELLING_LOGISTICS
 *             - OFFICE_EXPENSES
 *             - MEETING_REFRESHMENT
 *             - FURNITURE_FIXTURE
 *             - COMPUTER_DEVICES
 *             - PROFESSIONAL_FEE
 *             - MISCELLANEOUS
 *             - SHAREHOLDERS_DIVIDEND
 *             - OTHER
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
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
 *       - in: query
 *         name: cancelled
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: List of expenses with pagination
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
 *               month:
 *                 type: string
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
 *                 enum: [CHICKEN, FEED, MEDICINE, ...]
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
    if (!req.user?.id || req.user?.role !== "admin")
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
 *       400:
 *         description: Invalid ID
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
    if (!req.user?.id || req.user?.role !== "admin")
      return res.status(401).json({ error: "Unauthorized" });

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
 *     summary: Get expense summary (totals by head/farm)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}$'
 *           example: 2025-12
 *         description: Month in YYYY-MM format
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
 *       400:
 *         description: Invalid month format
 *       401:
 *         description: Unauthorized
 */
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
