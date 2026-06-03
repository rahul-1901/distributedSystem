import SubmissionModel from "../models/submission.models.js";

export class SubmissionRepository {
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

  async getTopResults(hackathonId) {
    return SubmissionModel.find({
      hackathon: hackathonId,
    })
      .sort({
        hackathonPoints: -1,
      })
      .limit(10)
      .populate("participant", "name avatar email")
      .populate("team", "name members")
      .lean();
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

  async getHackathonSubmissions(hackathonId) {
    return SubmissionModel.find({
      hackathon: hackathonId,
    })
      .populate("participant", "name email")
      .populate("team", "name leader members")
      .sort({
        createdAt: -1,
      });
  }

  async findByIdWithHackathon(submissionId) {
    return SubmissionModel.findById(submissionId).populate("hackathon");
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
}
