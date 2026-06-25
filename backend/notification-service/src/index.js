import { redisClient, connectRedis } from "./config/redis.js";
import { emailWorker } from "./workers/email.worker.js";
import { logger } from "./utils/logger.js";
import notificationRoutes from "./routes/notification.routes.js"
import express from "express";

await connectRedis();

const app = express();

app.use(
  "/notifications",
  notificationRoutes
);

logger.info(
  {
    service: "notification-service",
    pid: process.pid,
  },
  "Notification Service Started"
);

const shutdown = async (signal) => {
  logger.info({ signal }, "Starting graceful shutdown");

  try {
    await emailWorker.close();
    logger.info("Email worker closed");

    await redisClient.quit();
    logger.info("Redis connection closed");

    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Shutdown failed");

    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception");

  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled Rejection");

  shutdown("UNHANDLED_REJECTION");
});
