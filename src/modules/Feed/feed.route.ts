import express, { Router } from "express";
import {
  createFeedPurchaseController,
  getFeedPurchasesController,
  updateFeedPurchaseController,
  deleteFeedPurchaseController,
  getFeedPurchaseSummaryController,
} from "./feed.controller";

const router = Router();

router.post("/", createFeedPurchaseController);
router.get("/", getFeedPurchasesController);
router.put("/:id", updateFeedPurchaseController);
router.delete("/:id", deleteFeedPurchaseController);
router.get("/summary", getFeedPurchaseSummaryController);

export default router;
