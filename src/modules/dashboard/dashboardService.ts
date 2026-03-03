import prisma from "../../utils/Prisma";
import { format } from "date-fns";
import { getDateRangeWhere } from "../../utils/UtilityFunctions";

export interface ServiceResponse<T = any> {
  statusCode: number;
  message: string;
  data: T | null;
}

// Egg Production Summary
export const getEggProductionSummaryService = async (
  farm?: string,
  startDate?: string,
  endDate?: string,
): Promise<ServiceResponse> => {
  const where = getDateRangeWhere("date", startDate, endDate);
  if (farm) where.farm = farm;

  try {
    const production = await prisma.eggProduction.groupBy({
      by: ["farm"],
      where,
      _sum: { chickenEggs: true, eggsSold: true, totalEggs: true },
      orderBy: { _sum: { totalEggs: "desc" } },
    });

    const total = await prisma.eggProduction.aggregate({
      where,
      _sum: { chickenEggs: true, eggsSold: true, totalEggs: true },
    });

    // Graph data: daily/weekly totals
    const dailyProduction = await prisma.eggProduction
      .findMany({
        where,
        orderBy: { date: "asc" },
        select: { date: true, totalEggs: true },
      })
      .then((data) =>
        data.map((item) => ({
          date: format(new Date(item.date), "dd MMM"),
          totalEggs: item.totalEggs ?? 0,
        })),
      );

    return {
      statusCode: 200,
      message: "success",
      data: {
        totalProduced: total._sum.chickenEggs ?? 0,
        totalSold: total._sum.eggsSold ?? 0,
        totalEggs: total._sum.totalEggs ?? 0,
        byFarm: production,
        graphData: {
          dailyProduction,
        },
      },
    };
  } catch (err: any) {
    console.error("[getEggProductionSummaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate egg production summary",
      data: null,
    };
  }
};

// Feed Purchase Summary
export const getFeedPurchaseSummaryService = async (
  farm?: string,
  startDate?: string,
  endDate?: string,
): Promise<ServiceResponse> => {
  const where = getDateRangeWhere("date", startDate, endDate);
  if (farm) where.farm = farm;

  try {
    const purchases = await prisma.feedPurchase.groupBy({
      by: ["farm"],
      where,
      _sum: { bags: true, debit: true, credit: true, runningBalance: true },
      orderBy: { _sum: { debit: "desc" } },
    });

    const total = await prisma.feedPurchase.aggregate({
      where,
      _sum: { bags: true, debit: true, credit: true, runningBalance: true },
    });

    // Graph data: purchases over time
    const dailyPurchases = await prisma.feedPurchase
      .findMany({
        where,
        orderBy: { date: "asc" },
        select: { date: true, debit: true },
      })
      .then((data) =>
        data.map((item) => ({
          date: format(new Date(item.date), "dd MMM"),
          cost: item.debit ?? 0,
        })),
      );

    return {
      statusCode: 200,
      message: "success",
      data: {
        totalBags: total._sum.bags ?? 0,
        totalDebit: total._sum.debit ?? 0,
        totalCredit: total._sum.credit ?? 0,
        runningBalance: total._sum.runningBalance ?? 0,
        byFarm: purchases,
        graphData: {
          dailyCosts: dailyPurchases,
        },
      },
    };
  } catch (err: any) {
    console.error("[getFeedPurchaseSummaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate feed purchases summary",
      data: null,
    };
  }
};

export const getExpenseSummaryService = async (
  farm?: string,
  startDate?: string,
  endDate?: string,
): Promise<ServiceResponse> => {
  const where = getDateRangeWhere("expenseDate", startDate, endDate); // ← fixed
  if (farm) where.farm = farm;

  try {
    const expenses = await prisma.expense.groupBy({
      by: ["head"],
      where,
      _sum: { expenseCost: true },
      orderBy: { _sum: { expenseCost: "desc" } },
    });

    const total = await prisma.expense.aggregate({
      where,
      _sum: { expenseCost: true },
    });

    const monthlyExpenses = await prisma.expense
      .groupBy({
        by: ["expenseDate"],
        where,
        _sum: { expenseCost: true },
      })
      .then((data) =>
        data.map((item) => ({
          month: format(new Date(item.expenseDate!), "MMM yyyy"), // ! = non-null assertion
          total: item._sum.expenseCost ?? 0,
        })),
      );

    return {
      statusCode: 200,
      message: "success",
      data: {
        totalExpenses: total._sum.expenseCost ?? 0,
        byHead: expenses,
        graphData: {
          monthlyTotals: monthlyExpenses,
        },
      },
    };
  } catch (err: any) {
    console.error("[getExpenseSummaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate expenses summary",
      data: null,
    };
  }
};

export const getEggSaleSummaryService = async (
  farm?: string,
  startDate?: string,
  endDate?: string,
): Promise<ServiceResponse> => {
  const where = getDateRangeWhere("saleDate", startDate, endDate); // ← fixed
  if (farm) where.farm = farm;

  try {
    const sales = await prisma.eggSale.groupBy({
      by: ["farm"],
      where,
      _sum: {
        eggsSold: true,
        totalAmount: true,
        amountReceived: true,
        paymentDue: true,
      },
      orderBy: { _sum: { totalAmount: "desc" } },
    });

    const total = await prisma.eggSale.aggregate({
      where,
      _sum: {
        eggsSold: true,
        totalAmount: true,
        amountReceived: true,
        paymentDue: true,
      },
    });

    const dailySales = await prisma.eggSale
      .findMany({
        where,
        orderBy: { saleDate: "asc" },
        select: { saleDate: true, totalAmount: true },
      })
      .then((data) =>
        data.map((item) => ({
          date: format(new Date(item.saleDate), "dd MMM"),
          revenue: item.totalAmount ?? 0,
        })),
      );

    return {
      statusCode: 200,
      message: "success",
      data: {
        totalEggsSold: total._sum.eggsSold ?? 0,
        totalRevenue: total._sum.totalAmount ?? 0,
        totalReceived: total._sum.amountReceived ?? 0,
        totalDue: total._sum.paymentDue ?? 0,
        byFarm: sales,
        graphData: {
          dailyRevenue: dailySales,
        },
      },
    };
  } catch (err: any) {
    console.error("[getEggSaleSummaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate egg sales summary",
      data: null,
    };
  }
};
