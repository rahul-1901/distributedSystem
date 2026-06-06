import { VoteService } from "./voting.service.js";
import { SubmissionVoteRepository } from "../../repositories/submissionVote.repository.js";
import { SubmissionRepository } from "../../repositories/submission.repository.js";
import { RegistrationRepository } from "../../repositories/registration.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { TeamRepository } from "../../repositories/team.repository.js";
import { CacheService } from "../cacheService/cache.service.js";
import { logger } from "../../utils/logger.js";

const submissionVoteRepository = new SubmissionVoteRepository();

const submissionRepository = new SubmissionRepository();

const registrationRepository = new RegistrationRepository();

const hackathonRepository = new HackathonRepository();

const teamRepository = new TeamRepository();

const cacheService = new CacheService();

export const voteService = new VoteService(
  submissionVoteRepository,
  submissionRepository,
  registrationRepository,
  hackathonRepository,
  teamRepository,
  cacheService,
  logger
);
