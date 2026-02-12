import express, { Router } from "express";
import {
  createExpenseController,
  getExpensesController,
  updateExpenseController,
  deleteExpenseController,
  getExpenseSummaryController,
} from "./expense.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const expensesRouter = Router();

expensesRouter.use(authMiddleware); // protect all routes

expensesRouter.post("/", createExpenseController);
expensesRouter.get("/", getExpensesController);
expensesRouter.put("/:id", updateExpenseController);
expensesRouter.delete("/:id", deleteExpenseController);
expensesRouter.get("/summary", getExpenseSummaryController);

export default expensesRouter;
