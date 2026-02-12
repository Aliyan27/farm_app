import authRouter from "../modules/auth/auth.route";
import expensesRouter from "../modules/expenses/expense.route";
import userRouter from "../modules/user/user.route";

const routes = {
  public: [{ endpoint: "/auth", router: authRouter }],
  private: [
    { endpoint: "/user", router: userRouter },
    { endpoint: "/expenses", router: expensesRouter },
  ],
};

export default routes;
