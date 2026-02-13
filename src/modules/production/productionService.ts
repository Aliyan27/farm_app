import { z } from "zod";
import prisma from "../../utils/Prisma";
import {
  createEggProductionSchema,
  updateEggProductionSchema,
  eggProductionQuerySchema,
} from "./production.validation";

type CreateInput = z.infer<typeof createEggProductionSchema>;
type UpdateInput = z.infer<typeof updateEggProductionSchema>;
type QueryInput = z.infer<typeof eggProductionQuerySchema>;

export interface ServiceResponse<T = any> {
  statusCode: number;
  message: string;
  data: T | null;
}

export const createEggProductionService = async (
  data: CreateInput,
): Promise<ServiceResponse> => {
  try {
    const record = await prisma.eggProduction.create({
      data: {
        date: data.date,
        month: data.month,
        farm: data.farm,
        chickenEggs: data.chickenEggs,
        totalEggs: data.totalEggs,
        notes: data.notes,
      },
    });

    return {
      statusCode: 201,
      message: "Egg production recorded",
      data: record,
    };
  } catch (err: any) {
    console.error("[createEggProduction] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to record production",
      data: null,
    };
  }
};

export const getEggProductionsService = async (
  query: QueryInput,
): Promise<ServiceResponse> => {
  const { page, limit, search, ...filters } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.farm) where.farm = filters.farm;
  if (filters.month) where.month = filters.month;

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = filters.startDate;
    if (filters.endDate) where.date.lte = filters.endDate;
  }

  if (search) {
    where.notes = { contains: search, mode: "insensitive" };
  }

  try {
    const [records, total] = await Promise.all([
      prisma.eggProduction.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { date: "desc" }, // newest first
          { id: "desc" },
        ],
      }),
      prisma.eggProduction.count({ where }),
    ]);

    return {
      statusCode: 200,
      message: "Production records retrieved",
      data: {
        items: records,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (err: any) {
    console.error("[getEggProductions] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to fetch production records",
      data: null,
    };
  }
};

export const getEggProductionSummaryService = async (
  month?: string,
  farm?: string,
): Promise<ServiceResponse> => {
  const where: any = {};

  if (month) where.month = month;
  if (farm) where.farm = farm;

  try {
    const byFarm = await prisma.eggProduction.groupBy({
      by: ["farm"],
      where,
      _sum: { chickenEggs: true, totalEggs: true },
      orderBy: { _sum: { chickenEggs: "desc" } },
    });

    const total = await prisma.eggProduction.aggregate({
      where,
      _sum: { chickenEggs: true, totalEggs: true },
    });

    const totalEggs = total._sum?.chickenEggs ?? 0;

    return {
      statusCode: 200,
      message: "Monthly production summary",
      data: {
        totalEggs,
        byFarm,
      },
    };
  } catch (err: any) {
    console.error("[getEggProductionSummary] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to generate summary",
      data: null,
    };
  }
};

export const updateEggProductionService = async (
  data: UpdateInput,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.eggProduction.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Egg production record not found",
        data: null,
      };
    }

    const updated = await prisma.eggProduction.update({
      where: { id: data.id },
      data: {
        date: data.date,
        month: data.month,
        farm: data.farm,
        chickenEggs: data.chickenEggs,
        totalEggs: data.totalEggs,
        notes: data.notes,
      },
    });

    return {
      statusCode: 200,
      message: "Egg production record updated successfully",
      data: updated,
    };
  } catch (err: any) {
    console.error("[updateEggProductionService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to update egg production record",
      data: null,
    };
  }
};

export const deleteEggProductionService = async (
  id: number,
): Promise<ServiceResponse> => {
  try {
    const existing = await prisma.eggProduction.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        statusCode: 404,
        message: "Egg production record not found",
        data: null,
      };
    }

    await prisma.eggProduction.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      message: "Egg production record deleted successfully",
      data: null,
    };
  } catch (err: any) {
    console.error("[deleteEggProductionService] Error:", err);

    if (err.code === "P2025") {
      return {
        statusCode: 404,
        message: "Egg production record not found",
        data: null,
      };
    }

    return {
      statusCode: 500,
      message: "Failed to delete egg production record",
      data: null,
    };
  }
};
