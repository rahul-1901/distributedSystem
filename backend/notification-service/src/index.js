import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./config/db.js";
import { connectRedis, redisClient } from "./config/redis.js";
import notificationRoutes from "./routes/notification.routes.js";
import pushRoutes from "./routes/push.routes.js";
import { emailWorker } from "./workers/email.worker.js";
import { pushWorker } from "./workers/push.worker.js";
import { logger } from "./utils/logger.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { metricsHandler, metricsMiddleware } from "./metrics/metrics.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { initSentry, Sentry } from "./config/sentry.js";
dotenv.config();
initSentry();
const PORT = process.env.PORT || 5004;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);
app.use(metricsMiddleware);

app.get("/metrics", metricsHandler);
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "notification-service",
    status: "healthy",
  });
});

app.use("/", notificationRoutes);
app.use("/push", pushRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`Notification Service running on port ${PORT}`);
    });

    logger.info(
      {
        service: "notification-service",
        pid: process.pid,
      },
      "Notification Service Started"
    );
  } catch (error) {
    logger.fatal(
      {
        err: error,
      },
      "Failed to start Notification Service"
    );

    process.exit(1);
  }
};

await startServer();

const shutdown = async (signal) => {
  logger.info({ signal }, "Starting graceful shutdown");

  try {
    await emailWorker.close();
    logger.info("Email worker closed");

    await pushWorker.close();
    logger.info("Push worker closed");

    await redisClient.quit();
    logger.info("Redis connection closed");

    process.exit(0);
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      "Shutdown failed"
    );

    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception");
  Sentry.captureException(error);
  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled Rejection");
  Sentry.captureException(reason);
  shutdown("UNHANDLED_REJECTION");
});
