import MatchModel from "../models/match.model.js";

export class MatchRepository {
  async create(data) {
    return MatchModel.create(data);
  }

  async findById(matchId) {
    return MatchModel.findById(matchId)
      .populate("teamA", "name leader members")
      .populate("teamB", "name leader members")
      .populate("winner", "name");
  }

  async findByRound(hackathonId, phaseId) {
    return MatchModel.find({
      hackathon: hackathonId,
      phaseId,
    })
      .populate("teamA", "name")
      .populate("teamB", "name")
      .populate("winner", "name")
      .sort({ order: 1 })
      .lean();
  }

  async findAllForHackathon(hackathonId) {
    return MatchModel.find({
      hackathon: hackathonId,
    })
      .populate("teamA", "name")
      .populate("teamB", "name")
      .populate("winner", "name")
      .lean();
  }

  async findUnresolvedForTeamInPhase(hackathonId, phaseId, teamId) {
    return MatchModel.findOne({
      hackathon: hackathonId,
      phaseId,
      status: { $ne: "COMPLETED" },
      $or: [{ teamA: teamId }, { teamB: teamId }],
    });
  }

  async updateScore(matchId, { scoreA, scoreB, winner }) {
    return MatchModel.findByIdAndUpdate(
      matchId,
      {
        scoreA,
        scoreB,
        winner,
        status: "COMPLETED",
      },
      { new: true }
    );
  }

  async updateStatus(matchId, status) {
    return MatchModel.findByIdAndUpdate(matchId, { status }, { new: true });
  }

  async updateSchedule(matchId, scheduledAt) {
    return MatchModel.findByIdAndUpdate(
      matchId,
      { scheduledAt },
      { new: true }
    );
  }

  async bulkReorder(updates) {
    if (!updates.length) return { modifiedCount: 0 };

    return MatchModel.bulkWrite(
      updates.map(({ matchId, order }) => ({
        updateOne: {
          filter: { _id: matchId },
          update: { order },
        },
      }))
    );
  }

  async deleteById(matchId) {
    return MatchModel.findOneAndDelete({
      _id: matchId,
      status: { $ne: "COMPLETED" },
    });
  }

  async existsForHackathon(hackathonId) {
    return MatchModel.exists({ hackathon: hackathonId });
  }

  async findUpcomingForReminder(withinMinutes, milestone) {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + withinMinutes * 60 * 1000);

    return MatchModel.find({
      status: "SCHEDULED",
      scheduledAt: { $ne: null, $gte: now, $lte: windowEnd },
      remindersSent: { $ne: milestone },
    })
      .populate("teamA", "name leader members")
      .populate("teamB", "name leader members")
      .populate("hackathon", "title slug");
  }

  async markReminderSent(matchId, milestone) {
    return MatchModel.updateOne(
      { _id: matchId },
      { $addToSet: { remindersSent: milestone } }
    );
  }
}
