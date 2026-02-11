import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import routes from "./routes";

const router = Router();

//public routes
for (let route of routes.public) {
  router.use(route.endpoint, route.router);
}

//Auth
router.use(authMiddleware);

//authenticated routes
for (let route of routes.private) {
  router.use(route.endpoint, route.router);
}

export default router;
