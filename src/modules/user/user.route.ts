import { Router } from "express";
import {
  changePasswordController,
  sendVerificationEmailController,
  updateProfileController,
  verifyEmailController,
} from "./user.controller";

const userRouter = Router();
userRouter.post("/change-password", changePasswordController);
userRouter.put("/profile", updateProfileController);

userRouter.post("/send-verification-email", sendVerificationEmailController);
userRouter.post("/verify-email", verifyEmailController);

export default userRouter;
