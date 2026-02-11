import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const dbURL = process.env["DATABASE_URL"];

if (!dbURL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create a connection pool (recommended over single connections)
const pool = new Pool({
  connectionString: dbURL,
  // optional: tune for local dev if needed
  max: 10, // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
