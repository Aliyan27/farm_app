// src/routes/reportRoutes.ts (or appRoutes.ts)
import express from "express";
import {
  getExpenseSummaryController,
  getEggProductionSummaryController,
  getEggSaleSummaryController,
  getFeedPurchaseSummaryController,
} from "./dashboard.controller";

const router = express.Router();

router.get("/expenses", getExpenseSummaryController);
router.get("/egg-productions", getEggProductionSummaryController);
router.get("/egg-sales", getEggSaleSummaryController);
router.get("/feed-purchases", getFeedPurchaseSummaryController);

export default router;
