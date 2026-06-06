import { voteService } from "../services/votingService/voting.service.instance.js";

export const toggleVote = async (req, res, next) => {
  try {
    const result = await voteService.toggleVote({
      submissionId: req.params.submissionId,

      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getVotingSubmissions = async (req, res, next) => {
  try {
    const submissions = await voteService.getVotingSubmissions(
      req.params.hackathonId
    );

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getVotingSubmissionById = async (req, res, next) => {
  try {
    const submission = await voteService.getVotingSubmissionById(
      req.params.submissionId
    );

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    next(error);
  }
};
