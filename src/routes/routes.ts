import authRouter from "../modules/auth/auth.route";
import expensesRouter from "../modules/expenses/expense.route";
import eggProductionRouter from "../modules/production/production.route";
import userRouter from "../modules/user/user.route";
import eggSaleRouter from "../modules/sale/sale.route";
import feedPurchaseRouter from "../modules/Feed/feed.route";

const routes = {
  public: [{ endpoint: "/auth", router: authRouter }],
  private: [
    { endpoint: "/user", router: userRouter },
    { endpoint: "/expenses", router: expensesRouter },
    { endpoint: "/egg-productions", router: eggProductionRouter },
    { endpoint: "/egg-sales", router: eggSaleRouter },
    { endpoint: "/feed-purchase", router: feedPurchaseRouter },
  ],
};

export default routes;
