import { logger } from "../../utils/logger.js";
import { SubmissionRepository } from "../../repositories/submission.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { SubmissionService } from "./submission.service.js";
import { cacheService } from "../cacheService/cache.service.instance.js";
import { TeamRepository } from "../../repositories/team.repository.js";
import { RegistrationRepository } from "../../repositories/registration.repository.js";
import { MediaServiceClient } from "../mediaService/media.client.js";
import { NotificationClient } from "../../clients/notification.client.js";

const submissionRepository = new SubmissionRepository();

const hackathonRepository = new HackathonRepository();

const teamRepository = new TeamRepository();

const registrationRepository = new RegistrationRepository();

const mediaServiceClient = new MediaServiceClient();

const notificationClient = new NotificationClient();

export const submissionService = new SubmissionService(
  submissionRepository,
  hackathonRepository,
  teamRepository,
  registrationRepository,
  mediaServiceClient,
  cacheService,
  notificationClient,
  logger
);
