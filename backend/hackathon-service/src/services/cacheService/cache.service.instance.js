import { redisClient } from "../../config/redis.js";
import { CacheService } from "./cache.service.js";

export const cacheService =
  new CacheService(
    redisClient
  );