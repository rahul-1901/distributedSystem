import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { REDIS_KEYS } from "../../config/redisKeys.js";

export class SubmissionService {
  constructor(submissionRepository, hackathonRepository, cacheService, logger) {
    this.submissionRepository = submissionRepository;

    this.hackathonRepository = hackathonRepository;

    this.cacheService = cacheService;

    this.logger = logger;
  }

  async getHackathonResults(hackathonId) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    const hackathon = await this.hackathonRepository.getResultVisibility(
      hackathonId
    );

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    if (!hackathon.showResult) {
      throw new ForbiddenError("Results are not public");
    }

    const cacheKey = REDIS_KEYS.RESULTS(hackathonId);

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger.info({ hackathonId }, "Results cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger.error({ error }, "Redis read failed");
    }

    this.logger.info({ hackathonId }, "Results cache miss");

    const results = await this.submissionRepository.getTopResults(hackathonId);

    try {
      await this.cacheService.set(cacheKey, results, 86400);
    } catch (error) {
      this.logger.error({ error }, "Redis write failed");
    }

    return results;
  }
}
