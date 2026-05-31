import mongoose from "mongoose";
import { getNowUTC } from "../../utils/dateUtils.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { REDIS_KEYS } from "../../config/redisKeys.js";

export class HackathonService {
  constructor(hackathonRepository, logger, cacheService) {
    this.hackathonRepository = hackathonRepository;
    this.logger = logger;
    this.cacheService = cacheService;
  }

  async getActiveHackathons() {
    const cacheKey = REDIS_KEYS.ACTIVE_HACKATHONS;

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger?.info("Active hackathons cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger?.warn({ error }, "Redis read failed");
    }

    this.logger?.info("Active hackathons cache miss");

    const now = getNowUTC();

    const hackathons = await this.hackathonRepository.getActiveHackathons(now);

    try {
      await this.cacheService.set(cacheKey, hackathons, 300);
    } catch (error) {
      this.logger?.warn({ error }, "Redis write failed");
    }

    return hackathons;
  }

  async getExpiredHackathons() {
    const cacheKey = REDIS_KEYS.EXPIRED_HACKATHONS;

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger.info("Expired hackathons cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger.error({ error }, "Redis read failed");
    }

    this.logger.info("Expired hackathons cache miss");

    const now = getNowUTC();

    const hackathons = await this.hackathonRepository.getExpiredHackathons(now);

    try {
      await this.cacheService.set(cacheKey, hackathons, 1800);
    } catch (error) {
      this.logger.error({ error }, "Redis write failed");
    }

    return hackathons;
  }

  async getUpcomingHackathons() {
    const cacheKey = REDIS_KEYS.UPCOMING_HACKATHONS;

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger.info("Upcoming hackathons cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger.error({ error }, "Redis read failed");
    }

    this.logger.info("Upcoming hackathons cache miss");

    const now = getNowUTC();

    const hackathons = await this.hackathonRepository.getUpcomingHackathons(
      now
    );

    try {
      await this.cacheService.set(cacheKey, hackathons, 600);
    } catch (error) {
      this.logger.error({ error }, "Redis write failed");
    }

    return hackathons;
  }

  async getHackathonById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    const cacheKey = REDIS_KEYS.HACKATHON(id);

    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        this.logger.info({ hackathonId: id }, "Hackathon cache hit");

        return cachedData;
      }
    } catch (error) {
      this.logger.error({ error }, "Redis read failed");
    }

    this.logger.info({ hackathonId: id }, "Hackathon cache miss");

    const hackathon = await this.hackathonRepository.getById(id);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    try {
      await this.cacheService.set(cacheKey, hackathon, 300);
    } catch (error) {
      this.logger.error({ error }, "Redis write failed");
    }

    return hackathon;
  }

  async getHackathonGallery(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    const hackathon = await this.hackathonRepository.getGallery(id);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    return hackathon.gallery || [];
  }

  async invalidatePublicCaches(hackathonId) {
    try {
      await this.cacheService.delMany([
        ...PUBLIC_HACKATHON_KEYS,
        REDIS_KEYS.HACKATHON(hackathonId),
      ]);

      this.logger.info(
        {
          hackathonId,
        },
        "Hackathon cache invalidated"
      );
    } catch (error) {
      this.logger.error({ error }, "Cache invalidation failed");
    }
  }
}
