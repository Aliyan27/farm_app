import authRouter from "../modules/auth/auth.route";
import expensesRouter from "../modules/expenses/expense.route";
import eggProductionRouter from "../modules/production/production.route";
import userRouter from "../modules/user/user.route";

const routes = {
  public: [{ endpoint: "/auth", router: authRouter }],
  private: [
    { endpoint: "/user", router: userRouter },
    { endpoint: "/expenses", router: expensesRouter },
    { endpoint: "/egg-productions", router: eggProductionRouter },
  ],
};

export default routes;
