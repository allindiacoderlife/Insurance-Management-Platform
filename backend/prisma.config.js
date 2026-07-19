import "dotenv/config";
import { defineConfig } from "prisma/config";
import { config } from "./src/config/app.config.js";

export default defineConfig({
  schema: "prisma/",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: config.database.url,
  },
});
