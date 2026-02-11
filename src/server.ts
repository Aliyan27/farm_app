import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { env } from "./utils/env";

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
