import { submissionReviewService } from "../services/submissionReviewService/submissionReview.service.instance.js";

export const reviewSubmission = async (req, res, next) => {
  try {
    const review = await submissionReviewService.reviewSubmission({
      submissionId: req.params.submissionId,

      judgeId: req.admin._id,

      score: Number(req.body.score),

      feedback: req.body.feedback,
    });

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathonSubmissionsForJudge = async (req, res, next) => {
  try {
    const submissions =
      await submissionReviewService.getHackathonSubmissionsForJudge({
        hackathonId: req.params.hackathonId,

        judgeId: req.admin._id,
      });

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionDetailsForJudge = async (req, res, next) => {
  try {
    const submission =
      await submissionReviewService.getSubmissionDetailsForJudge({
        submissionId: req.params.submissionId,

        judgeId: req.admin._id,
      });

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionReviews = async (req, res, next) => {
  try {
    const reviews = await submissionReviewService.getSubmissionReviews({
      submissionId: req.params.submissionId,

      judgeId: req.admin._id,
    });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
