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

/**
 * @swagger
 * tags:
 *   name: Salaries
 *   description: Employee salary management endpoints (monthly payroll records)
 */

/**
 * @swagger
 * /salaries:
 *   post:
 *     summary: Create a new salary record
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - month
 *               - employeeName
 *               - designation
 *               - salaryAmount
 *               - total
 *             properties:
 *               month:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 example: "December"
 *               employeeName:
 *                 type: string
 *                 example: "Rana Adeel"
 *               designation:
 *                 type: string
 *                 example: "S. Manager"
 *               farm:
 *                 type: string
 *                 enum: [KAASI_19, MATITAL, COMBINED, OTHER, MANAGEMENT]
 *                 example: "MANAGEMENT"
 *               attendance:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 31
 *                 example: 31
 *               basicSalary:
 *                 type: number
 *                 minimum: 0
 *                 example: 40000
 *               salaryAmount:
 *                 type: number
 *                 minimum: 0
 *                 example: 40000
 *               advance:
 *                 type: number
 *                 minimum: 0
 *                 example: 0
 *               penaltyReward:
 *                 type: number
 *                 example: -5000
 *               total:
 *                 type: number
 *                 minimum: 0
 *                 example: 35000
 *               remarks:
 *                 type: string
 *                 example: "Penalty applied"
 *     responses:
 *       201:
 *         description: Salary record created
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

/**
 * @swagger
 * /salaries:
 *   get:
 *     summary: Get paginated list of salary records
 *     tags: [Salaries]
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
 *         name: month
 *         schema:
 *           type: string
 *           example: December
 *       - in: query
 *         name: farm
 *         schema:
 *           type: string
 *           enum: [KAASI_19, MATITAL, COMBINED, OTHER, MANAGEMENT]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search by employee name, designation or remarks
 *     responses:
 *       200:
 *         description: Paginated list of salary records
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

/**
 * @swagger
 * /salaries/{id}:
 *   put:
 *     summary: Update an existing salary record
 *     tags: [Salaries]
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
 *               month:
 *                 type: string
 *               employeeName:
 *                 type: string
 *               designation:
 *                 type: string
 *               farm:
 *                 type: string
 *                 enum: [KAASI_19, MATITAL, COMBINED, OTHER, MANAGEMENT]
 *               attendance:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 31
 *               basicSalary:
 *                 type: number
 *                 minimum: 0
 *               salaryAmount:
 *                 type: number
 *                 minimum: 0
 *               advance:
 *                 type: number
 *                 minimum: 0
 *               penaltyReward:
 *                 type: number
 *               total:
 *                 type: number
 *                 minimum: 0
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Salary record updated
 *       400:
 *         description: Invalid ID or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary record not found
 */
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

/**
 * @swagger
 * /salaries/{id}:
 *   delete:
 *     summary: Delete a salary record
 *     tags: [Salaries]
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
 *         description: Salary record deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary record not found
 */
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

/**
 * @swagger
 * /salaries/summary:
 *   get:
 *     summary: Get salary summary (totals by farm/month)
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: December
 *       - in: query
 *         name: farm
 *         schema:
 *           type: string
 *           enum: [KAASI_19, MATITAL, COMBINED, OTHER, MANAGEMENT]
 *     responses:
 *       200:
 *         description: Salary summary
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
 *                     totalPaid:
 *                       type: number
 *                     totalAdvance:
 *                       type: number
 *                     totalSalaryAmount:
 *                       type: number
 *                     byFarm:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
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
