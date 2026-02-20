import express, { Router } from "express";
import {
  createSalaryController,
  getSalariesController,
  updateSalaryController,
  deleteSalaryController,
  getSalarySummaryController,
} from "./salaries.controller";

const router = Router();

router.post("/", createSalaryController);
router.get("/", getSalariesController);
router.put("/:id", updateSalaryController);
router.delete("/:id", deleteSalaryController);
router.get("/summary", getSalarySummaryController);

export default router;
