import { logger } from "../../utils/logger.js";
import { TeamRepository } from "../../repositories/team.repository.js";
import { RegistrationRepository } from "../../repositories/registration.repository.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { TeamService } from "./team.service.js";

const teamRepository = new TeamRepository();

const registrationRepository = new RegistrationRepository();

const userRepository = new UserRepository();

const hackathonRepository = new HackathonRepository();

export const teamService = new TeamService(
  teamRepository,
  registrationRepository,
  userRepository,
  hackathonRepository,
  logger
);
