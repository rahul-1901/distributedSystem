import { connectRedis, redisClient } from "./config/redis.js";
import { emailWorker } from "./workers/email.worker.js";
import { logger } from "./utils/logger.js";

await connectRedis();

logger.info("Email Worker Started");

const shutdown = async (signal) => {
  logger.info(
    `${signal} received. Starting worker shutdown`
  );

  try {
    await emailWorker.close();

    logger.info("BullMQ worker closed");

    await redisClient.quit();

    logger.info("Redis connection closed");

    process.exit(0);
  } catch (error) {
    logger.error(
      { err: error },
      "Worker shutdown failed"
    );

    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

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