import { Request, Response } from "express";
import { getIncomeStatementService } from "./reportsService";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { getCustomizedError } from "../../utils/UtilityFunctions";

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Aggregated financial reports and summaries (Income Statement, etc.)
 */

/**
 * @swagger
 * /reports/income-statement:
 *   get:
 *     summary: Generate Income Statement for a date range
 *     description: |
 *       Returns a summarized Income Statement for the given date range (or all time if no dates provided).
 *       Aggregates data from Egg Sales (revenue), Expenses (COGS & OpEx), and other sources.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-01-01"
 *         description: Start of the period (YYYY-MM-DD). Optional.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-01-31"
 *         description: End of the period (YYYY-MM-DD). Optional.
 *       - in: query
 *         name: farm
 *         schema:
 *           type: string
 *           enum: [KAASI_19, MATITAL, COMBINED, OTHER, MANAGEMENT]
 *           description: Optional farm filter
 *     responses:
 *       200:
 *         description: Income Statement generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Income statement generated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "From 2026-01-01 to 2026-01-31"
 *                     grossRevenue:
 *                       type: number
 *                     otherIncome:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     cogs:
 *                       type: object
 *                       properties:
 *                         chicken: { type: number }
 *                         feed: { type: number }
 *                         medicine: { type: number }
 *                         vaccine: { type: number }
 *                         total: { type: number }
 *                     operatingExpenses:
 *                       type: object
 *                       properties:
 *                         rent: { type: number }
 *                         utilities: { type: number }
 *                         salariesPayments: { type: number }
 *                         mess: { type: number }
 *                         powerElectric: { type: number }
 *                         pol: { type: number }
 *                         packingMaterial: { type: number }
 *                         repairMaintenance: { type: number }
 *                         officeExpenses: { type: number }
 *                         meetingRefreshment: { type: number }
 *                         travellingLogistics: { type: number }
 *                         miscellaneous: { type: number }
 *                         total: { type: number }
 *                     totalExpenses:
 *                       type: number
 *                     netIncome:
 *                       type: number
 *                     notes:
 *                       type: string
 *                       example: "Profitable"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error during aggregation
 */
export const getIncomeStatementController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const { startDate, endDate, farm } = req.query;

    const result = await getIncomeStatementService({
      startDate: typeof startDate === "string" ? startDate : undefined,
      endDate: typeof endDate === "string" ? endDate : undefined,
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
