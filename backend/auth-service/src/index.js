import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { connectRedis, redisClient } from "./config/redis.js";
import authRoutes from "./routes/auth.routes.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());

app.use(compression());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  try {
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
      },
      "Incoming Request"
    );
  } catch (err) {
    console.error("Logger failed", err);
  }

  next();
});

app.get("/", (req, res) => {
  return res.json({
    success: true,
    service: "auth-service",
    message: "Auth Service running",
  });
});

app.use("/", authRoutes);

app.use(errorHandler);

await connectDB();
await connectRedis();

const server = app.listen(env.PORT, () => {
  logger.info(
    `Auth service running on port ${env.PORT}`
  );
});

const shutdown = async (signal) => {
  logger.info(
    `${signal} received. Starting graceful shutdown`
  );

  try {
    await new Promise((resolve) =>
      server.close(resolve)
    );

    logger.info("HTTP server closed");

    await redisClient.quit();

    logger.info("Redis connection closed");

    await mongoose.connection.close();

    logger.info("MongoDB connection closed");

    logger.info(
      "Graceful shutdown completed"
    );

    process.exit(0);
  } catch (error) {
    logger.error(
      { err: error },
      "Graceful shutdown failed"
    );

    process.exit(1);
  }
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  logger.fatal(
    { err: error },
    "Uncaught Exception"
  );

  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason) => {
  logger.fatal(
    { reason },
    "Unhandled Rejection"
  );

  shutdown("UNHANDLED_REJECTION");
});