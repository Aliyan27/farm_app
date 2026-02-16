import express, { Router } from "express";
import {
  createExpenseController,
  getExpensesController,
  updateExpenseController,
  deleteExpenseController,
  getExpenseSummaryController,
} from "./expense.controller";

const expensesRouter = Router();

expensesRouter.post("/", createExpenseController);
expensesRouter.get("/", getExpensesController);
expensesRouter.put("/:id", updateExpenseController);
expensesRouter.delete("/:id", deleteExpenseController);
expensesRouter.get("/summary", getExpenseSummaryController);

export default expensesRouter;
