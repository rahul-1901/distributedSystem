import { logger } from "../../utils/logger.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { HackathonService } from "./hackathon.service.js";
import { cacheService } from "../cacheService/cache.service.instance.js";
import { RegistrationRepository } from "../../repositories/registration.repository.js";
import { SubmissionRepository } from "../../repositories/submission.repository.js";
import { AdminRepository } from "../../repositories/admin.repository.js";

const hackathonRepository = new HackathonRepository();

const registrationRepository = new RegistrationRepository();

const submissionRepository = new SubmissionRepository();

const adminRepository = new AdminRepository();

export const hackathonService = new HackathonService(
  hackathonRepository,
  submissionRepository,
  registrationRepository,
  adminRepository,
  logger,
  cacheService
);
