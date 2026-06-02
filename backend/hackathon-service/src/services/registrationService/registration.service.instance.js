import { logger } from "../../utils/logger.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { RegistrationRepository } from "../../repositories/registration.repository.js";
import { RegistrationService } from "./registration.service.js";

const registrationRepository = new RegistrationRepository();

const userRepository = new UserRepository();

const hackathonRepository = new HackathonRepository();

export const registrationService = new RegistrationService(
  registrationRepository,
  userRepository,
  hackathonRepository,
  logger
);
