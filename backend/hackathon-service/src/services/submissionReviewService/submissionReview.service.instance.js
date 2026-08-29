import { logger } from "../../utils/logger.js";
import { SubmissionReviewRepository } from "../../repositories/submissionReview.repository.js";
import { SubmissionRepository } from "../../repositories/submission.repository.js";
import { JudgeAssignmentRepository } from "../../repositories/judgeAssignment.repository.js";
import { HackathonRepository } from "../../repositories/hackathon.repository.js";
import { TeamRepository } from "../../repositories/team.repository.js";
import { SubmissionReviewService } from "./submissionReview.service.js";
import { CacheService } from "../cacheService/cache.service.js";
import { notificationClient } from "../../clients/notification.client.instance.js";

const submissionReviewRepository = new SubmissionReviewRepository();

const submissionRepository = new SubmissionRepository();

const judgeAssignmentRepository = new JudgeAssignmentRepository();

const hackathonRepository = new HackathonRepository();

const cacheService = new CacheService();

const teamRepository = new TeamRepository();

export const submissionReviewService = new SubmissionReviewService(
  submissionReviewRepository,
  submissionRepository,
  judgeAssignmentRepository,
  hackathonRepository,
  cacheService,
  logger,
  notificationClient,
  teamRepository
);
