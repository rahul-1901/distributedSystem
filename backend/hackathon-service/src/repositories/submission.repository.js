import SubmissionModel from "../models/submission.models.js";

export class SubmissionRepository {
  async getTopResults(hackathonId) {
    return SubmissionModel.find({
      hackathon: hackathonId,
    })
      .sort({
        hackathonPoints: -1,
      })
      .limit(10)
      .populate(
        "participant",
        "name avatar email"
      )
      .populate(
        "team",
        "name members"
      )
      .lean();
  }
}