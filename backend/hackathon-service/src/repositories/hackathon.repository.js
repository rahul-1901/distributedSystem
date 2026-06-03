import hackathonModel from "../models/hackathon.model.js";

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

  async getByIdForSubmission(id) {
    return hackathonModel.findById(id).select(
      `
        title
        participationType
        phases
        submissionStartDate
        submissionEndDate
        `
    );
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

  async incrementParticipants(id, session = null) {
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

  async getActiveSubmissionPhase(hackathonId, currentTime) {
    return hackathonModel.findOne(
      {
        _id: hackathonId,
        phases: {
          $elemMatch: {
            phaseType: "SUBMISSION",
            isActive: true,
            startDate: {
              $lte: currentTime,
            },
            endDate: {
              $gte: currentTime,
            },
          },
        },
      },
      {
        phases: {
          $elemMatch: {
            phaseType: "SUBMISSION",
            isActive: true,
            startDate: {
              $lte: currentTime,
            },
            endDate: {
              $gte: currentTime,
            },
          },
        },
        participationType: 1,
        title: 1,
      }
    );
  }

  async getPhases(hackathonId) {
    return hackathonModel
      .findById(hackathonId)
      .select("phases participationType")
      .lean();
  }
}
