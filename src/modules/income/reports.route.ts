import express, { Router } from "express";
import { getIncomeStatementController } from "./report.controller";

const router = Router();

router.get("/reports/income-statement", getIncomeStatementController);

export default router;
