import TeamModel from "../models/team.model.js";

export class TeamRepository {
  async create(teamData, session = null) {
    const [team] = await TeamModel.create([teamData], { session });

    return team;
  }

  async findById(teamId) {
    return TeamModel.findById(teamId);
  }

  async findByCode(secretCode) {
    return TeamModel.findOne({
      secretCode,
    });
  }

  async findByNameAndHackathon(name, hackathonId) {
    return TeamModel.findOne({
      name,
      hackathon: hackathonId,
    });
  }

  async save(team, session = null) {
    return team.save({
      session,
    });
  }

  async getTeamDetails(teamId) {
    return TeamModel.findById(teamId)
      .populate("leader", "name email")
      .populate("members", "name email")
      .populate("pendingMembers", "name email")
      .populate("hackathon", "title participationType maxTeamSize")
      .lean();
  }

  async searchByCode(secretCode) {
    return TeamModel.findOne({
      secretCode,
    })
      .populate("leader", "name email")
      .populate("members", "name email")
      .populate("hackathon", "title participationType maxTeamSize")
      .lean();
  }

  async removePendingMember(team, userId) {
    team.pendingMembers = team.pendingMembers.filter(
      (id) => id.toString() !== userId.toString()
    );

    return team.save();
  }

  async getPendingRequests(teamId) {
    return TeamModel.findById(teamId).populate("pendingMembers", "name email");
  }

  async findByIdWithSession(teamId, session) {
    return TeamModel.findById(teamId).session(session);
  }

  async updateTeamName(teamId, teamName, session = null) {
    return TeamModel.findByIdAndUpdate(
      teamId,
      {
        name: teamName,
      },
      {
        new: true,
        session,
      }
    );
  }

  async deleteTeam(teamId, session = null) {
    return TeamModel.findByIdAndDelete(teamId, {
      session,
    });
  }

  async getTeamsByHackathon(hackathonId) {
    return TeamModel.find({
      hackathon: hackathonId,
    })
      .populate("leader", "name email userName")
      .populate("members", "name email userName")
      .sort({ createdAt: -1 })
      .lean();
  }
}
