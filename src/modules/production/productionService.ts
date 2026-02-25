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

        farm: data.farm,
        chickenEggs: data.chickenEggs,
        totalEggs: data.totalEggs,
        notes: data.notes,
      },
    });

    return {
      statusCode: 201,
      message: "success",
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
  page: number,
  limit: number,
  farm?: string,
  startDate?: string,
  endDate?: string,
): Promise<ServiceResponse> => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (farm) where.farm = farm;

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      where.date.lt = end;
    }
  }

  try {
    const [records, total] = await Promise.all([
      prisma.eggProduction.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: "desc" }, { id: "desc" }],
      }),
      prisma.eggProduction.count({ where }),
    ]);

    return {
      statusCode: 200,
      message: "success",
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
    console.error("[getEggProductionsService] Error:", err);
    return {
      statusCode: 500,
      message: "Failed to fetch production records",
      data: null,
    };
  }
};

export const getEggProductionSummaryService = async (
  farm?: string,
  startDate?: string,
  endDate?: string,
): Promise<ServiceResponse> => {
  const where: any = {};

  if (farm) where.farm = farm;

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      where.date.lt = end;
    }
  }

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
      message: "success",
      data: {
        totalEggs,
        byFarm,
      },
    };
  } catch (err: any) {
    console.error("[getEggProductionSummaryService] Error:", err);
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
        farm: data.farm,
        chickenEggs: data.chickenEggs,
        totalEggs: data.totalEggs,
        notes: data.notes,
      },
    });

    return {
      statusCode: 200,
      message: "success",
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
      message: "success",
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
