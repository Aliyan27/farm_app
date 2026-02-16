// routes/egg-sale.ts
import { Router } from "express";
import {
  createEggSaleController,
  getEggSalesController,
  updateEggSaleController,
  deleteEggSaleController,
  getEggSaleSummaryController,
} from "./sale.controller";

const router = Router();

router.post("/", createEggSaleController);
router.get("/", getEggSalesController);
router.put("/:id", updateEggSaleController);
router.delete("/:id", deleteEggSaleController);
router.get("/summary", getEggSaleSummaryController);

export default router;
