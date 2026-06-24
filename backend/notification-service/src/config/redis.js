import { createClient } from "redis";
import { logger } from "../utils/logger.js";
import { env } from "./env.js";

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.error({ err }, "Redis error");
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
