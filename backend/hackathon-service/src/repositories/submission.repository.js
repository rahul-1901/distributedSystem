import SubmissionModel from "../models/submission.models.js";

export class SubmissionRepository {
  async countByHackathon(hackathonId) {
    return SubmissionModel.countDocuments({
      hackathon: hackathonId,
    });
  }

  async countByHackathonAndPhase(hackathonId, phaseId) {
    return SubmissionModel.countDocuments({
      hackathon: hackathonId,
      phaseId,
    });
  }

  async getSubmissionsByPhase(hackathonId, phaseId) {
    return SubmissionModel.find({
      hackathon: hackathonId,
      phaseId,
    })
      .populate("participant", "name email")
      .populate("team", "name")
      .sort({
        submittedAt: -1,
      })
      .lean();
  }

  async create(data, session = null) {
    const [submission] = await SubmissionModel.create([data], { session });

    return submission;
  }

  async findById(id) {
    return SubmissionModel.findById(id);
  }

  async findByParticipantAndPhase(participantId, hackathonId, phaseId) {
    return SubmissionModel.findOne({
      participant: participantId,
      hackathon: hackathonId,
      phaseId,
    });
  }

  async findByTeamAndPhase(teamId, hackathonId, phaseId) {
    return SubmissionModel.findOne({
      team: teamId,
      hackathon: hackathonId,
      phaseId,
    });
  }

  async update(submissionId, updateData) {
    return SubmissionModel.findByIdAndUpdate(submissionId, updateData, {
      new: true,
    });
  }

  async getSubmissionById(submissionId) {
    return SubmissionModel.findById(submissionId)
      .populate("participant", "name email")
      .populate("team", "name")
      .populate("hackathon", "title");
  }

  async getTopResults(hackathonId, leaderboardLimit = null) {
    const query = SubmissionModel.find({
      hackathon: hackathonId,
    })
      .sort({
        hackathonPoints: -1,
        submittedAt: 1,
      })
      .populate("participant", "name avatar email")
      .populate("team", "name members");

    if (leaderboardLimit && leaderboardLimit > 0) {
      query.limit(leaderboardLimit);
    }

    return query.lean();
  }

  async getMyIndividualSubmission(participantId, hackathonId, phaseId) {
    return SubmissionModel.findOne({
      participant: participantId,
      hackathon: hackathonId,
      phaseId,
    })
      .populate("hackathon", "title")
      .populate("participant", "name email");
  }

  async getMyTeamSubmission(teamId, hackathonId, phaseId) {
    return SubmissionModel.findOne({
      team: teamId,
      hackathon: hackathonId,
      phaseId,
    })
      .populate("hackathon", "title")
      .populate("team", "name leader members");
  }

  async deleteSubmission(submissionId, session = null) {
    return SubmissionModel.findByIdAndDelete(submissionId, { session });
  }

  async findByIdWithHackathon(submissionId) {
    return SubmissionModel.findById(submissionId).populate(
      "hackathon",
      `
        title
        phases
        showResult
        publicLeaderboardLimit
        votingConfig
        `
    );
  }

  async getMyIndividualSubmissions(participantId, hackathonId) {
    return SubmissionModel.find({
      participant: participantId,
      hackathon: hackathonId,
    })
      .select("_id phaseId title submittedAt")
      .lean();
  }

  async getMyTeamSubmissions(teamId, hackathonId) {
    return SubmissionModel.find({
      team: teamId,
      hackathon: hackathonId,
    })
      .select("_id phaseId title submittedAt")
      .lean();
  }

  async updateScoreStats(submissionId, averageScore, reviewCount) {
    return SubmissionModel.findByIdAndUpdate(
      submissionId,
      {
        averageScore,
        reviewCount,

        hackathonPoints: averageScore,
      },
      {
        new: true,
      }
    );
  }

  async exists(submissionId) {
    return SubmissionModel.exists({
      _id: submissionId,
    });
  }

  async getHackathonSubmissions(hackathonId) {
    return SubmissionModel.find({
      hackathon: hackathonId,
    })
      .populate("participant", "name email")
      .populate("team", "name leader members")
      .sort({
        submittedAt: -1,
      })
      .lean();
  }

  async getLeaderboard(hackathonId) {
    return SubmissionModel.find({
      hackathon: hackathonId,
    })
      .populate("participant", "name email")
      .populate("team", "name")
      .sort({
        hackathonPoints: -1,
        submittedAt: 1,
      })
      .lean();
  }

  async updateVoteCount(submissionId, voteCount) {
    return SubmissionModel.findByIdAndUpdate(
      submissionId,
      {
        voteCount,
      },
      {
        new: true,
      }
    );
  }

  async getVotingSubmissions(hackathonId, phaseId) {
    return SubmissionModel.find({
      hackathon: hackathonId,
      phaseId,
    })
      .select(
        `
        title
        description
        voteCount
        team
        participant
        submittedAt
      `
      )
      .populate("team", "name")
      .populate("participant", "name")
      .sort({
        voteCount: -1,
      })
      .lean();
  }

  async getVotingSubmissionById(submissionId) {
    return SubmissionModel.findById(submissionId)
      .select(
        `
        title
        description
        submissionData
        voteCount
        phaseId
        hackathon
        team
        participant
        submittedAt
      `
      )
      .populate("team", "name leader members")
      .populate("participant", "name")
      .lean();
  }

  async getLeaderboardSubmissions(hackathonId, phaseId) {
    return SubmissionModel.find({
      hackathon: hackathonId,
      phaseId,
    })
      .populate("participant", "name avatar email")
      .populate("team", "name members")
      .lean();
  }
}
