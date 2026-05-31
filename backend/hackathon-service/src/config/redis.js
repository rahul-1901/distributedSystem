import { createClient } from "redis";
import { logger } from "../utils/logger.js";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  logger.error(
    { err },
    "Redis connection error"
  );
});

redisClient.on("connect", () => {
  logger.info(
    "Redis connected"
  );
});

export const connectRedis =
  async () => {
    await redisClient.connect();
  };