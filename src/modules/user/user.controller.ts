import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { changePasswordSchema } from "./user.validation";
import { changePasswordService } from "./userService"; // ← adjust path/filename as needed
import { getCustomizedError } from "../../utils/UtilityFunctions";

export const changePasswordController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = changePasswordSchema.parse(req.body);

    const result = await changePasswordService(validatedData, req.user.id);

    if (result.data) {
      return res.status(result.statusCode).json({
        message: result.message,
        data: result.data,
      });
    }

    return res.status(result.statusCode).json({
      message: result.message,
    });
  } catch (error: any) {
    return getCustomizedError(error, res);
  }
};
