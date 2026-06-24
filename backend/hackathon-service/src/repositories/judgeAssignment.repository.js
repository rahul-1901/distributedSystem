import JudgeAssignmentModel from "../models/judgeAssignment.model.js";

export class JudgeAssignmentRepository {
  async create(data, session = null) {
    const [assignment] = await JudgeAssignmentModel.create([data], { session });

    return assignment;
  }

  async findJudgeAssignment(hackathonId, judgeId) {
    return JudgeAssignmentModel.findOne({
      hackathon: hackathonId,
      judge: judgeId,
    });
  }

  async getHackathonJudges(hackathonId) {
    return JudgeAssignmentModel.find({
      hackathon: hackathonId,
    })
      .populate("judge", "name email")
      .populate("assignedBy", "name email")
      .lean();
  }

  async getJudgeHackathons(judgeId) {
    return JudgeAssignmentModel.find({
      judge: judgeId,
    })
      .populate("hackathon", "title slug lifecycleStatus image")
      .lean();
  }

  async removeJudge(hackathonId, judgeId) {
    return JudgeAssignmentModel.findOneAndDelete({
      hackathon: hackathonId,
      judge: judgeId,
    });
  }

  async exists(hackathonId, judgeId) {
    return JudgeAssignmentModel.exists({
      hackathon: hackathonId,
      judge: judgeId,
    });
  }
}
