import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/app.config.js";
import { PrismaClient } from "../generated/prisma/index.js";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const connectionString = config.database.url;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables. Please check your Vercel Project Settings.");
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

// Lazy initialization using a Proxy
let prismaInstance = globalForPrisma.prisma;

export const prisma = new Proxy({}, {
  get(target, prop) {
    if (!prismaInstance) {
      prismaInstance = createPrismaClient();
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance;
      }
    }
    return prismaInstance[prop];
  }
});

export default prisma;

