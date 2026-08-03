import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/app.config.js";
import { PrismaClient } from "../generated/prisma/index.js";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const connectionString = config.database.url;
  if (!connectionString) {
    console.error("🔴 DATABASE_URL is undefined! Please add it in Vercel Project Settings > Environment Variables.");
  }
  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
