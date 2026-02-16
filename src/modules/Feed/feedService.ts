import { z } from "zod";
import prisma from "../../utils/Prisma";
import {
  createFeedPurchaseSchema,
  updateFeedPurchaseSchema,
  feedPurchaseQuerySchema,
} from "./feed.validation";

type CreateInput = z.infer<typeof createFeedPurchaseSchema>;
type UpdateInput = z.infer<typeof updateFeedPurchaseSchema>;
type QueryInput = z.infer<typeof feedPurchaseQuerySchema>;

export interface ServiceResponse<T = any> {
  statusCode: number;
  message: string;
  data: T | null;
}

// CREATE
export const createFeedPurchaseService = async (
  data: CreateInput,
): Promise<ServiceResponse> => {
  try {
    // Optional: calculate running balance (requires previous record)
    const lastRecord = await prisma.feedPurchase.findFirst({
      orderBy: { date: "desc" },
      where: { farm: data.farm },
    });

    let newBalance = lastRecord?.runningBalance ?? 0;
    if (data.debit) newBalance -= data.debit;
    if (data.credit) newBalance += data.credit;

    const purchase = await prisma.feedPurchase.create({
      data: {
        date: data.date,
        month: data.month,
        voucherType: data.voucherType,
        feedType: data.feedType,
        farm: data.farm,
        bags: data.bags,
        description: data.description,
        debit: data.debit,
        credit: data.credit,
        runningBalance: newBalance,
        reconciled: data.reconciled,
        postedToStatement: data.postedToStatement,
      },
    });

    return {
      statusCode: 201,
      message: "Feed purchase recorded",
      data: purchase,
    };
  } catch (err: any) {
    console.error("[createFeedPurchaseService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to record feed purchase",
      data: null,
    };
  }
};

// READ list
export const getFeedPurchasesService = async (
  query: QueryInput,
): Promise<ServiceResponse> => {
  const { page, limit, search, reconciled, ...filters } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.farm) where.farm = filters.farm;
  if (filters.month) where.month = filters.month;
  if (filters.voucherType) where.voucherType = filters.voucherType;

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = filters.startDate;
    if (filters.endDate) where.date.lte = filters.endDate;
  }

  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { feedType: { contains: search, mode: "insensitive" } },
    ];
  }

  if (reconciled === "true") where.reconciled = true;
  if (reconciled === "false") where.reconciled = false;

  try {
    const [purchases, total] = await Promise.all([
      prisma.feedPurchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: "desc" }, { id: "desc" }],
      }),
      prisma.feedPurchase.count({ where }),
    ]);

    return {
      statusCode: 200,
      message: "Feed purchases retrieved",
      data: {
        items: purchases,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (err: any) {
    console.error("[getFeedPurchasesService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to fetch feed purchases",
      data: null,
    };
  }
};

// UPDATE
export const updateFeedPurchaseService = async (
  data: UpdateInput,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.feedPurchase.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Feed purchase not found",
        data: null,
      };
    }

    // Recalculate balance if debit/credit changed
    let newBalance = existing.runningBalance ?? 0;
    if (data.debit !== undefined) newBalance -= data.debit;
    if (data.credit !== undefined) newBalance += data.credit;

    const updated = await prisma.feedPurchase.update({
      where: { id: data.id },
      data: {
        date: data.date,
        month: data.month,
        voucherType: data.voucherType,
        feedType: data.feedType,
        farm: data.farm,
        bags: data.bags,
        description: data.description,
        debit: data.debit,
        credit: data.credit,
        runningBalance: newBalance,
        reconciled: data.reconciled,
        postedToStatement: data.postedToStatement,
      },
    });

    return {
      statusCode: 200,
      message: "Feed purchase updated",
      data: updated,
    };
  } catch (err: any) {
    console.error("[updateFeedPurchaseService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to update feed purchase",
      data: null,
    };
  }
};

// DELETE
export const deleteFeedPurchaseService = async (
  id: number,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.feedPurchase.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Feed purchase not found",
        data: null,
      };
    }

    await prisma.feedPurchase.delete({ where: { id } });

    return {
      statusCode: 200,
      message: "Feed purchase deleted",
      data: null,
    };
  } catch (err: any) {
    console.error("[deleteFeedPurchaseService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to delete feed purchase",
      data: null,
    };
  }
};

// SUMMARY (total debit/credit, balance overview)
export const getFeedPurchaseSummaryService = async (
  month?: string,
  farm?: string,
): Promise<ServiceResponse> => {
  const where: any = {};

  if (month) where.month = month;
  if (farm) where.farm = farm;

  try {
    const summary = await prisma.feedPurchase.aggregate({
      where,
      _sum: {
        debit: true,
        credit: true,
        bags: true,
      },
    });

    // Latest running balance
    const latest = await prisma.feedPurchase.findFirst({
      where,
      orderBy: { date: "desc" },
      select: { runningBalance: true },
    });

    return {
      statusCode: 200,
      message: "Feed purchase summary",
      data: {
        totalDebit: summary._sum.debit ?? 0,
        totalCredit: summary._sum.credit ?? 0,
        totalBags: summary._sum.bags ?? 0,
        currentBalance: latest?.runningBalance ?? 0,
      },
    };
  } catch (err: any) {
    console.error("[getFeedPurchaseSummaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate summary",
      data: null,
    };
  }
};
