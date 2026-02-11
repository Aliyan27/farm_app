import authRouter from "../modules/auth/auth.route";
import userRouter from "../modules/user/user.route";

const routes = {
  public: [{ endpoint: "/auth", router: authRouter }],
  private: [{ endpoint: "/user", router: userRouter }],
};

export default routes;
