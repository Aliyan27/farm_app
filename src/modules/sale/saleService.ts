import { z } from "zod";
import prisma from "../../utils/Prisma";
import {
  createEggSaleSchema,
  updateEggSaleSchema,
  eggSaleQuerySchema,
} from "./sale.validation";

type CreateInput = z.infer<typeof createEggSaleSchema>;
type UpdateInput = z.infer<typeof updateEggSaleSchema>;
type QueryInput = z.infer<typeof eggSaleQuerySchema>;

export interface ServiceResponse<T = any> {
  statusCode: number;
  message: string;
  data: T | null;
}

export const createEggSaleService = async (
  data: CreateInput,
): Promise<ServiceResponse> => {
  try {
    const sale = await prisma.eggSale.create({
      data: {
        saleDate: data.saleDate,
        challanNumber: data.challanNumber,
        eggsSold: data.eggsSold,
        totalAmount: data.totalAmount,
        paymentDue: data.paymentDue,
        pricePerEgg: data.pricePerEgg,
        farm: data.farm,
        amountReceived: data.amountReceived,
        notes: data.notes,
        type: data.type,
      },
    });

    return {
      statusCode: 201,
      message: "success",
      data: sale,
    };
  } catch (err: any) {
    console.error("[createEggSaleService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to create egg sale",
      data: null,
    };
  }
};

export const getEggSalesService = async (
  query: QueryInput,
): Promise<ServiceResponse> => {
  const { page, limit, search, ...filters } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.farm) where.farm = filters.farm;

  if (filters.startDate || filters.endDate) {
    where.saleDate = {};
    if (filters.startDate) where.saleDate.gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setDate(end.getDate() + 1);
      where.saleDate.lt = end;
    }
  }
  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { challanNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [sales, total] = await Promise.all([
      prisma.eggSale.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ saleDate: "desc" }, { id: "desc" }],
      }),
      prisma.eggSale.count({ where }),
    ]);

    return {
      statusCode: 200,
      message: "success",
      data: {
        items: sales,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (err: any) {
    console.error("[getEggSalesService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to fetch egg sales",
      data: null,
    };
  }
};

export const updateEggSaleService = async (
  data: UpdateInput,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.eggSale.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Egg sale record not found",
        data: null,
      };
    }

    const updated = await prisma.eggSale.update({
      where: { id: data.id },
      data: {
        saleDate: data.saleDate,
        challanNumber: data.challanNumber,
        eggsSold: data.eggsSold,
        totalAmount: data.totalAmount,
        paymentDue: data.paymentDue,
        pricePerEgg: data.pricePerEgg,
        farm: data.farm,
        amountReceived: data.amountReceived,
        notes: data.notes,
        type: data.type,
      },
    });

    return {
      statusCode: 200,
      message: "success",
      data: updated,
    };
  } catch (err: any) {
    console.error("[updateEggSaleService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to update egg sale",
      data: null,
    };
  }
};

export const deleteEggSaleService = async (
  id: number,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.eggSale.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Egg sale record not found",
        data: null,
      };
    }

    await prisma.eggSale.delete({ where: { id } });

    return {
      statusCode: 200,
      message: "success",
      data: null,
    };
  } catch (err: any) {
    console.error("[deleteEggSaleService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to delete egg sale",
      data: null,
    };
  }
};

export const getEggSaleSummaryService = async (
  farm?: string,
  startDate?: string,
  endDate?: string,
): Promise<ServiceResponse> => {
  const where: any = {};

  if (farm) where.farm = farm;

  if (startDate || endDate) {
    where.saleDate = {};
    if (startDate) where.saleDate.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      where.saleDate.lt = end;
    }
  }

  try {
    const byFarm = await prisma.eggSale.groupBy({
      by: ["farm"],
      where,
      _sum: {
        eggsSold: true,
        totalAmount: true,
        amountReceived: true,
        paymentDue: true,
      },
      orderBy: {
        _sum: {
          totalAmount: "desc",
        },
      },
    });

    const totals = await prisma.eggSale.aggregate({
      where,
      _sum: {
        eggsSold: true,
        totalAmount: true,
        amountReceived: true,
        paymentDue: true,
      },
    });

    return {
      statusCode: 200,
      message: "success",
      data: {
        totalEggsSold: totals._sum.eggsSold ?? 0,
        totalRevenue: totals._sum.totalAmount ?? 0,
        totalReceived: totals._sum.amountReceived ?? 0,
        totalDue: totals._sum.paymentDue ?? 0,
        byFarm: byFarm.map((group) => ({
          farm: group.farm,
          _sum: {
            eggsSold: group._sum.eggsSold ?? null,
            totalAmount: group._sum.totalAmount ?? null,
            paymentReceived: group._sum.amountReceived ?? null,
            paymentDue: group._sum.paymentDue ?? null,
          },
        })),
      },
    };
  } catch (err: any) {
    console.error("[getEggSaleSummaryService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate summary",
      data: null,
    };
  }
};
