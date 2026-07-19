import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config/app.config.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

const PORT = config.port;

const app = express();
//! ─── Middleware ────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        config.corsOrigins.includes(origin) ||
        config.nodeEnv === "development" // Allow all origins in dev (including mobile IPs)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Error: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  }),
);
app.use(express.json());

//! ─── Backend Running ────────────────────────────────────────────
app.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({
      status: "Backend is running",
    });
  }),
);
//! ─── Health Check ────────────────────────────────────────────
app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    res.json({
      status: "Backend is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    });
  }),
);
//! ─── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

//! ─── App Listen ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
