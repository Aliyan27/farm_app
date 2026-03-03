import { Response } from "express";
import { ZodError } from "zod";

export const getCustomizedError = (error: any, res: Response) => {
  // ────────────────────────────────────────────────
  // JWT / Auth errors
  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // ────────────────────────────────────────────────
  // Zod validation errors (from schema.parse / safeParse)
  if (error instanceof ZodError) {
    // Format all issues into a clean, user-friendly message
    const formattedErrors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    console.log("[Zod Validation Error]", formattedErrors);

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
      // optional: full error details in dev only
      ...(process.env.NODE_ENV === "development" && {
        details: error.format(),
      }),
    });
  }

  // ────────────────────────────────────────────────
  // Prisma / DB errors (common examples)
  if (error.code === "P2002") {
    // unique constraint violation
    return res.status(409).json({
      success: false,
      message: "Record already exists (duplicate key)",
    });
  }

  if (error.code === "P2025") {
    // not found
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  // ────────────────────────────────────────────────
  // Generic fallback
  console.error("[Unhandled Error]", error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export const getDateRangeWhere = (
  fieldName: string,
  startDate?: string,
  endDate?: string,
) => {
  const where: any = {};
  if (startDate || endDate) {
    where[fieldName] = {};
    if (startDate) where[fieldName].gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      where[fieldName].lt = end;
    }
  }
  return where;
};
