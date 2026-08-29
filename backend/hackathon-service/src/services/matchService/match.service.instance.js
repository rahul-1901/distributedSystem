import { logger } from "../../utils/logger.js";
import { MatchRepository } from "../../repositories/match.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { TeamRepository } from "../../repositories/team.repository.js";
import { AdminRepository } from "../../repositories/admin.repository.js";
import { notificationClient } from "../../clients/notification.client.instance.js";
import { MatchService } from "./match.service.js";

const matchRepository = new MatchRepository();

const hackathonRepository = new HackathonRepository();

const teamRepository = new TeamRepository();

const adminRepository = new AdminRepository();

export const matchService = new MatchService(
  matchRepository,
  hackathonRepository,
  teamRepository,
  adminRepository,
  logger,
  notificationClient
);
