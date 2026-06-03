import { submissionReviewService } from "../services/submissionReviewService/submissionReview.service.instance.js";

export const reviewSubmission =
  async (
    req,
    res,
    next
  ) => {
    try {
      const review =
        await submissionReviewService.reviewSubmission({
          submissionId:
            req.params.submissionId,

          judgeId:
            req.admin._id,

          score:
            Number(
              req.body.score
            ),

          feedback:
            req.body.feedback,
        });

      return res.status(200).json({
        success: true,
        message:
          "Review submitted successfully",
        review,
      });
    } catch (error) {
      next(error);
    }
  };