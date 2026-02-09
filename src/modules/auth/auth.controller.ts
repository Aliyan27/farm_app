import { Request, Response } from "express";
import { signupSchema } from "./auth.validation";

export const signupController = (req: Request, res: Response) => {
  try {
    const data = signupSchema.parse(req.body);
    res.status(201).json({ message: "User created successfully", data });
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "invalid request data", details: error.errors });
  }
};
