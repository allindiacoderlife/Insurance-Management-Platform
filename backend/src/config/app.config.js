export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: ["http://localhost:5173", process.env.CLIENT_URL],
  database: {
    url: process.env.DATABASE_URL,
  },
};
