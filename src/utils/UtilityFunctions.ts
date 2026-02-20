import { Response } from "express";

export const getCustomizedError = (error: any, res: Response) => {
  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  console.log(error);
  return res.status(500).json({
    success: false,
    message: "Internal server error during authentication",
  });
};
