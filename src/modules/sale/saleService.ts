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

// CREATE
export const createEggSaleService = async (
  data: CreateInput,
): Promise<ServiceResponse> => {
  try {
    const sale = await prisma.eggSale.create({
      data: {
        saleDate: data.saleDate,
        month: data.month,
        challanNumber: data.challanNumber,
        farm: data.farm,
        amountReceived: data.amountReceived,
        description: data.description,
        type: data.type,
      },
    });

    return {
      statusCode: 201,
      message: "Egg sale recorded successfully",
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

// READ (list)
export const getEggSalesService = async (
  query: QueryInput,
): Promise<ServiceResponse> => {
  const { page, limit, search, ...filters } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.farm) where.farm = filters.farm;
  if (filters.month) where.month = filters.month;

  if (filters.startDate || filters.endDate) {
    where.saleDate = {};
    if (filters.startDate) where.saleDate.gte = filters.startDate;
    if (filters.endDate) where.saleDate.lte = filters.endDate;
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
      message: "Egg sales retrieved",
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

// UPDATE
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
        month: data.month,
        challanNumber: data.challanNumber,
        farm: data.farm,
        amountReceived: data.amountReceived,
        description: data.description,
        type: data.type,
      },
    });

    return {
      statusCode: 200,
      message: "Egg sale updated successfully",
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

// DELETE
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
      message: "Egg sale deleted successfully",
      data: null,
    };
  } catch (err: any) {
    console.error("[deleteEggSaleService] Error:", err);
    if (err.code === "P2025") {
      return {
        statusCode: 404,
        message: "Egg sale record not found",
        data: null,
      };
    }
    return {
      statusCode: 500,
      message: "Failed to delete egg sale",
      data: null,
    };
  }
};

// SUMMARY (total revenue, by farm)
export const getEggSaleSummaryService = async (
  month?: string,
  farm?: string,
): Promise<ServiceResponse> => {
  const where: any = {};

  if (month) where.month = month;
  if (farm) where.farm = farm;

  try {
    const byFarm = await prisma.eggSale.groupBy({
      by: ["farm"],
      where,
      _sum: { amountReceived: true },
      orderBy: { _sum: { amountReceived: "desc" } },
    });

    const total = await prisma.eggSale.aggregate({
      where,
      _sum: { amountReceived: true },
    });

    const totalRevenue = total._sum?.amountReceived ?? 0;

    return {
      statusCode: 200,
      message: "Egg sale summary generated",
      data: {
        totalRevenue,
        byFarm,
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
