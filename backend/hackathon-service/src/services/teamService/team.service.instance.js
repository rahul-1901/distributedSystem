import { logger } from "../../utils/logger.js";
import { TeamRepository } from "../../repositories/team.repository.js";
import { RegistrationRepository } from "../../repositories/registration.repository.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { TeamService } from "./team.service.js";
import { NotificationClient } from "../../clients/notification.client.js";

const teamRepository = new TeamRepository();

const registrationRepository = new RegistrationRepository();

const userRepository = new UserRepository();

const hackathonRepository = new HackathonRepository();

const notificationClient = new NotificationClient(logger);

export const teamService = new TeamService(
  teamRepository,
  registrationRepository,
  userRepository,
  hackathonRepository,
  notificationClient,
  logger
);
