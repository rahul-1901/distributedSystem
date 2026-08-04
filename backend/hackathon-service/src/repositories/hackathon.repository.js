import hackathonModel from "../models/hackathon.model.js";

export class HackathonRepository {
  async getApprovedHackathons() {
    return hackathonModel
      .find({
        status: "APPROVED",
      })
      .sort({
        featured: -1,
        featuredOrder: 1,
        createdAt: -1,
      })
      .lean({
        virtuals: true,
      });
  }

  async getById(id) {
    return hackathonModel
      .findById(id)
      .populate("createdBy", "adminName email organizationName")
      .lean({
        virtuals: true,
      });
  }

  async getByIdForSubmission(id) {
    return hackathonModel.findById(id).select(
      `
        title
        participationType
        phases
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
    return hackathonModel
      .findById(id)
      .select(
        `
        showResult
        publicLeaderboardLimit
        title
  
        phases
  
        votingConfig
  
        judgingConfig
      `
      )
      .lean();
  }

  async incrementParticipant(id, session = null) {
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

  async getPhasesEndingSoon(withinHours) {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + withinHours * 60 * 60 * 1000);

    // Same $elemMatch-as-filter-and-projection shape as getActiveSubmissionPhase
    // above, just across every hackathon instead of one. Note: like that
    // method, $elemMatch projection only surfaces the first matching phase per
    // document — if a single hackathon somehow had both a REGISTRATION and a
    // SUBMISSION phase ending in the same window, only one would be returned
    // per run; the other would still be caught on a later tick since its own
    // endDate keeps it inside the window until reminderSent is set.
    const matchStage = {
      phaseType: { $in: ["REGISTRATION", "SUBMISSION"] },
      isActive: true,
      reminderSent: { $ne: true },
      endDate: { $gte: now, $lte: windowEnd },
    };

    return hackathonModel
      .find(
        { phases: { $elemMatch: matchStage } },
        {
          phases: { $elemMatch: matchStage },
          participationType: 1,
          title: 1,
          slug: 1,
        }
      )
      .lean();
  }

  async markPhaseReminderSent(hackathonId, phaseId) {
    return hackathonModel.updateOne(
      { _id: hackathonId, "phases._id": phaseId },
      { $set: { "phases.$.reminderSent": true } }
    );
  }

  async getPhases(hackathonId) {
    return hackathonModel
      .findById(hackathonId)
      .select("phases participationType votingConfig lifecycleStatus")
      .lean({ virtuals: true });
  }

  async create(data) {
    return hackathonModel.create(data);
  }

  async findById(id) {
    return hackathonModel.findById(id);
  }

  async findByIdLean(id) {
    return hackathonModel.findById(id).lean({
      virtuals: true,
    });
  }

  async findByCreator(adminId) {
    return hackathonModel
      .find({
        createdBy: adminId,
      })
      .sort({
        createdAt: -1,
      })
      .lean({
        virtuals: true,
      });
  }

  async findByTitle(title) {
    return hackathonModel.findOne({
      title: {
        $regex: `^${title.trim()}$`,
        $options: "i",
      },
    });
  }

  async update(id, updateData) {
    return hackathonModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return hackathonModel.findByIdAndDelete(id);
  }

  async updateStatus(hackathonId, status, extraData = {}) {
    return hackathonModel.findByIdAndUpdate(
      hackathonId,
      {
        status,
        ...extraData,
      },
      {
        new: true,
      }
    );
  }

  async getPendingHackathons() {
    return hackathonModel
      .find({
        status: "PENDING_APPROVAL",
      })
      .populate("createdBy", "adminName email organizationName")
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  async getAllHackathonsForController() {
    return hackathonModel
      .find({})
      .populate("createdBy", "adminName email organizationName")
      .sort({
        createdAt: -1,
      })
      .lean({
        virtuals: true,
      });
  }

  async findBySlug(slug) {
    return hackathonModel
      .findOne({
        slug,
        status: "APPROVED",
      })
      .populate("createdBy", "adminName organizationName avatar")
      .lean({
        virtuals: true,
      });
  }

  async existsPublic(id) {
    return hackathonModel.exists({
      _id: id,
      status: "APPROVED",
    });
  }
}
