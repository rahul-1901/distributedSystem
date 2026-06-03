import { logger } from "../../utils/logger.js";

import { SubmissionReviewRepository } from "../../repositories/submissionReview.repository.js";

import { SubmissionRepository } from "../../repositories/submission.repository.js";

import { JudgeAssignmentRepository } from "../../repositories/judgeAssignment.repository.js";

import { SubmissionReviewService } from "./submissionReview.service.js";

const submissionReviewRepository =
  new SubmissionReviewRepository();

const submissionRepository =
  new SubmissionRepository();

const judgeAssignmentRepository =
  new JudgeAssignmentRepository();

export const submissionReviewService =
  new SubmissionReviewService(
    submissionReviewRepository,
    submissionRepository,
    judgeAssignmentRepository,
    logger
  );