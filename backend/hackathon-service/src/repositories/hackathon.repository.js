import hackathonModel from "../models/hackathon.models.js";

export class HackathonRepository {
  async getActiveHackathons(now) {
    return hackathonModel
      .find({
        startDate: { $lte: now },
        submissionEndDate: { $gte: now },
      })
      .sort({ endDate: 1 })
      .lean();
  }

  async getExpiredHackathons(now) {
    return hackathonModel
      .find({
        submissionEndDate: { $lt: now },
      })
      .sort({ submissionEndDate: -1 })
      .lean();
  }

  async getUpcomingHackathons(now) {
    return hackathonModel
      .find({
        startDate: { $gt: now },
      })
      .sort({ startDate: 1 })
      .lean();
  }

  async getById(id) {
    return hackathonModel.findById(id).lean();
  }

  async getGallery(id) {
    return hackathonModel.findById(id).select("gallery").lean();
  }

  async exists(id) {
    return hackathonModel.exists({
      _id: id,
    });
  }

  async getResultVisibility(id) {
    return hackathonModel.findById(id).select("showResult").lean();
  }

  async incrementParticipants(
    id,
    session = null
  ) {
    return hackathonModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          numParticipants: 1,
        },
      },
      {
        session,
        new: true,
      }
    );
  }
}
