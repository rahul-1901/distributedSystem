import { logger } from "../../utils/logger.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { HackathonService } from "./hackathon.service.js";
import { cacheService } from "../cacheService/cache.service.instance.js";
import { RegistrationRepository } from "../../repositories/registration.repository.js";
import { SubmissionRepository } from "../../repositories/submission.repository.js";
import { AdminRepository } from "../../repositories/admin.repository.js";
import { TeamRepository } from "../../repositories/team.repository.js";
import { JudgeAssignmentRepository } from "../../repositories/judgeAssignment.repository.js";
import { SubmissionReviewRepository } from "../../repositories/submissionReview.repository.js";
import { mediaServiceClient } from "../mediaService/media.client.instance.js";

const hackathonRepository = new HackathonRepository();

const registrationRepository = new RegistrationRepository();

const submissionRepository = new SubmissionRepository();

const adminRepository = new AdminRepository();

const teamRepository = new TeamRepository();

const judgeAssignmentRepository = new JudgeAssignmentRepository();

const submissionReviewRepository = new SubmissionReviewRepository();

export const hackathonService = new HackathonService(
  hackathonRepository,
  submissionRepository,
  registrationRepository,
  adminRepository,
  logger,
  cacheService,
  mediaServiceClient,
  teamRepository,
  judgeAssignmentRepository,
  submissionReviewRepository
);
