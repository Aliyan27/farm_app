import { Router } from "express";
import { changePasswordController } from "./user.controller";

const userRouter = Router();
userRouter.post("/change-password", changePasswordController);

export default userRouter;
