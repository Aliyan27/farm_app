import { Request, Response } from "express";
import { signupSchema, signinSchema } from "./auth.validation";
import { signupService, signinService } from "./authService";
import { getCustomizedError } from "../../utils/UtilityFunctions";

export const signupController = async (req: Request, res: Response) => {
  try {
    const data = signupSchema.parse(req.body);

    const result = await signupService(data);

    if (result.data) {
      return res.status(result.statusCode).json({
        message: result.message,
        user: result.data,
      });
    }

    return res.status(result.statusCode).json({
      message: result.message,
    });
  } catch (error: any) {
    return getCustomizedError(error, res);
  }
};

export const signinController = async (req: Request, res: Response) => {
  try {
    const data = signinSchema.parse(req.body);

    const result = await signinService(data);

    if (result.data) {
      return res.status(result.statusCode).json({
        message: result.message,
        ...result.data,
      });
    }

    return res.status(result.statusCode).json({
      message: result.message,
    });
  } catch (error: any) {
    return getCustomizedError(error, res);
  }
};
