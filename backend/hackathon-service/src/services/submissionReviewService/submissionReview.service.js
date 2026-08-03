import mongoose from "mongoose";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { REDIS_KEYS } from "../../config/redisKeys.js";

export class SubmissionReviewService {
  constructor(
    submissionReviewRepository,
    submissionRepository,
    judgeAssignmentRepository,
    hackathonRepository,
    cacheService,
    logger
  ) {
    this.submissionReviewRepository = submissionReviewRepository;
    this.submissionRepository = submissionRepository;
    this.judgeAssignmentRepository = judgeAssignmentRepository;
    this.hackathonRepository = hackathonRepository;
    this.cacheService = cacheService;
    this.logger = logger;
  }

  async reviewSubmission({ submissionId, judgeId, score, feedback }) {
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      throw new BadRequestError("Invalid submission id");
    }

    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    const hackathon = await this.hackathonRepository.getById(
      submission.hackathon
    );

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    const minScore = hackathon?.judgingConfig?.minScore ?? 0;

    const maxScore = hackathon?.judgingConfig?.maxScore ?? 100;

    if (typeof score !== "number" || score < minScore || score > maxScore) {
      throw new BadRequestError(
        `Score must be between ${minScore} and ${maxScore}`
      );
    }

    const assignment = await this.judgeAssignmentRepository.findJudgeAssignment(
      submission.hackathon,
      judgeId
    );

    if (!assignment) {
      throw new ForbiddenError("You are not assigned as a judge");
    }

    const existingReview =
      await this.submissionReviewRepository.findByJudgeAndSubmission(
        judgeId,
        submissionId
      );

    let review;

    if (existingReview) {
      review = await this.submissionReviewRepository.updateReview(
        existingReview._id,
        {
          score,
          feedback,
        }
      );
    } else {
      review = await this.submissionReviewRepository.create({
        submission: submissionId,

        hackathon: submission.hackathon,

        judge: judgeId,

        score,

        feedback,
      });
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

    try {
      await this.cacheService.del(
        REDIS_KEYS.RESULTS(submission.hackathon.toString())
      );
    } catch (error) {
      this.logger.error({ error }, "Failed to invalidate results cache");
    }

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
