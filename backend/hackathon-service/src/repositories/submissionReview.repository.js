import SubmissionReviewModel from "../models/submissionReview.model.js";

export class SubmissionReviewRepository {
  async create(data, session = null) {
    const [review] = await SubmissionReviewModel.create([data], { session });

    return review;
  }

  async findByJudgeAndSubmission(judgeId, submissionId) {
    return SubmissionReviewModel.findOne({
      judge: judgeId,
      submission: submissionId,
    });
  }

  async updateReview(reviewId, updateData) {
    return SubmissionReviewModel.findByIdAndUpdate(reviewId, updateData, {
      new: true,
    });
  }

  async getSubmissionReviews(submissionId) {
    return SubmissionReviewModel.find({
      submission: submissionId,
    })
      .populate("judge", "name email")
      .lean();
  }

  async getHackathonReviews(hackathonId) {
    return SubmissionReviewModel.find({
      hackathon: hackathonId,
    })
      .populate("judge", "name email")
      .populate("submission")
      .lean();
  }

  async getSubmissionAverage(submissionId) {
    const result = await SubmissionReviewModel.aggregate([
      {
        $match: {
          submission: submissionId,
        },
      },
      {
        $group: {
          _id: null,

          averageScore: {
            $avg: "$score",
          },

          reviewCount: {
            $sum: 1,
          },
        },
      },
    ]);

    return (
      result[0] || {
        averageScore: 0,
        reviewCount: 0,
      }
    );
  }

  async getJudgeReview(submissionId, judgeId) {
    return SubmissionReviewModel.findOne({
      submission: submissionId,
      judge: judgeId,
    });
  }

  async countReviews(submissionId) {
    return SubmissionReviewModel.countDocuments({
      submission: submissionId,
    });
  }

  async getJudgeReviews(hackathonId, judgeId) {
    return SubmissionReviewModel.find({
      hackathon: hackathonId,
      judge: judgeId,
    }).lean();
  }
}
