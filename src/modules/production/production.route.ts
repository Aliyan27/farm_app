import express, { Router } from "express";
import {
  createEggProductionController,
  deleteEggProductionController,
  getEggProductionsController,
  getEggProductionSummaryController,
  updateEggProductionController,
} from "./production.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/", createEggProductionController);
router.get("/", getEggProductionsController);
router.get("/summary", getEggProductionSummaryController);
router.put("/:id", updateEggProductionController);
router.delete("/:id", deleteEggProductionController);

export default router;
