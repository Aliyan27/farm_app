import { Router } from "express";
import {
  forgotPasswordController,
  verifyOTPController,
  signinController,
  signupController,
} from "./auth.controller";

const authRouter = Router();

authRouter.post("/signup", signupController);
authRouter.post("/signin", signinController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/verifyOTP", verifyOTPController);

export default authRouter;
