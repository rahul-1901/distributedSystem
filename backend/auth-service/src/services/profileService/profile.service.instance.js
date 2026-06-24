import { ProfileService } from "./profile.service.js";
import { profileRepository } from "../../repositories/profile.repository.instance.js";
import { logger } from "../../utils/logger.js";

export const profileService =
  new ProfileService(
    profileRepository,
    logger
  );