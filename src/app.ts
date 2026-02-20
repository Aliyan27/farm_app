import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import reportsRouter from "./modules/income/reports.route";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swaggerConfig"; // ← new import

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/api", routes);
app.use("/api", reportsRouter);

// Mount Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// redirect root to Swagger docs
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

export default app;
