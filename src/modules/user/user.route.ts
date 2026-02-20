import { Router } from "express";
import {
  changePasswordController,
  updateProfileController,
} from "./user.controller";

const userRouter = Router();
userRouter.post("/change-password", changePasswordController);
userRouter.patch("/profile", updateProfileController);

export default userRouter;
