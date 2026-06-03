import mongoose from "mongoose";

import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";

export class SubmissionReviewService {
  constructor(
    submissionReviewRepository,
    submissionRepository,
    judgeAssignmentRepository,
    logger
  ) {
    this.submissionReviewRepository =
      submissionReviewRepository;

    this.submissionRepository =
      submissionRepository;

    this.judgeAssignmentRepository =
      judgeAssignmentRepository;

    this.logger =
      logger;
  }

  async reviewSubmission({
    submissionId,
    judgeId,
    score,
    feedback,
  }) {
    if (
      !mongoose.Types.ObjectId.isValid(
        submissionId
      )
    ) {
      throw new BadRequestError(
        "Invalid submission id"
      );
    }

    if (
      typeof score !== "number" ||
      score < 0 ||
      score > 100
    ) {
      throw new BadRequestError(
        "Score must be between 0 and 100"
      );
    }

    const submission =
      await this.submissionRepository.findById(
        submissionId
      );

    if (!submission) {
      throw new NotFoundError(
        "Submission not found"
      );
    }

    const assignment =
      await this.judgeAssignmentRepository.findJudgeAssignment(
        submission.hackathon,
        judgeId
      );

    if (!assignment) {
      throw new ForbiddenError(
        "You are not assigned as a judge"
      );
    }

    const existingReview =
      await this.submissionReviewRepository.findByJudgeAndSubmission(
        judgeId,
        submissionId
      );

    let review;

    if (existingReview) {
      review =
        await this.submissionReviewRepository.updateReview(
          existingReview._id,
          {
            score,
            feedback,
          }
        );
    } else {
      review =
        await this.submissionReviewRepository.create(
          {
            submission:
              submissionId,

            hackathon:
              submission.hackathon,

            judge:
              judgeId,

            score,

            feedback,
          }
        );
    }

    const aggregate =
      await this.submissionReviewRepository.getSubmissionAverage(
        submission._id
      );

    await this.submissionRepository.updateScoreStats(
      submission._id,
      aggregate.averageScore,
      aggregate.reviewCount
    );

    this.logger.info(
      {
        submissionId,
        judgeId,
      },
      "Submission reviewed"
    );

    return review;
  }
}