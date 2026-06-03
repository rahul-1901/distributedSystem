import { logger } from "../../utils/logger.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { HackathonService } from "./hackathon.service.js";
import { cacheService } from "../cacheService/cache.service.instance.js";

const hackathonRepository = new HackathonRepository();

export const hackathonService = new HackathonService(
  hackathonRepository,
  logger,
  cacheService
);
