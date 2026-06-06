import SubmissionVoteModel from "../models/submissionVote.model.js";

export class SubmissionVoteRepository {
  async findVote(submissionId, voterId) {
    return SubmissionVoteModel.findOne({
      submission: submissionId,
      voter: voterId,
    });
  }

  async create(data, session = null) {
    const [vote] = await SubmissionVoteModel.create([data], { session });

    return vote;
  }

  async deleteVote(voteId, session = null) {
    return SubmissionVoteModel.findByIdAndDelete(voteId, { session });
  }

  async getVoteCount(submissionId) {
    return SubmissionVoteModel.countDocuments({
      submission: submissionId,
    });
  }

  async getMaxVoteCount(hackathonId, phaseId) {
    const result = await SubmissionVoteModel.aggregate([
      {
        $lookup: {
          from: "submissions",
          localField: "submission",
          foreignField: "_id",
          as: "submission",
        },
      },

      {
        $unwind: "$submission",
      },

      {
        $match: {
          "submission.hackathon": new mongoose.Types.ObjectId(hackathonId),

          "submission.phaseId": new mongoose.Types.ObjectId(phaseId),
        },
      },

      {
        $group: {
          _id: "$submission",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },

      {
        $limit: 1,
      },
    ]);

    return result[0]?.count || 0;
  }
}
