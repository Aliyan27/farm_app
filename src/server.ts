import app from "./app";
import dotenv from "dotenv";
import { env } from "./utils/env";

dotenv.config();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
