import { ProfileService } from "./profile.service.js";
import { profileRepository } from "../../repositories/profile.repository.instance.js";
import { logger } from "../../utils/logger.js";
import { MediaServiceClient } from "../mediaService/media.client.js";

const mediaServiceClient = new MediaServiceClient();

export const profileService =
  new ProfileService(
    profileRepository,
    mediaServiceClient,
    logger
  );