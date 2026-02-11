// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import prisma from "../utils/Prisma"; // ← adjust path (e.g. "../generated/prisma" or "../lib/prisma")
import { verifyToken } from "../utils/jwt"; // assuming you have this helper

// Extend Express Request type so TypeScript knows req.user exists
export interface AuthRequest extends Request {
  user?: {
    id: number; // Prisma Int → number in JS/TS
    name: string;
    email: string;
    role: string;
    // Add any other fields you need from your user model
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify & decode JWT (your verifyToken should throw if invalid/expired)
    const decoded = verifyToken(token) as { id: string | number }; // adjust based on your JWT payload

    // Important: Prisma uses number for Int @id fields
    const userId = Number(decoded.id);
    if (isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // Fetch user (exclude password in real apps!)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // Never select password here!
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found - please login again",
      });
    }

    // Attach to request for use in protected routes
    req.user = user;

    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};
