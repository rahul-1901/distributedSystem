import RegisteredParticipantsModel from "../models/registeredParticipants.model.js";

export class RegistrationRepository {
  async findByUserAndHackathon(userId, hackathonId) {
    return RegisteredParticipantsModel.findOne({
      user: userId,
      hackathon: hackathonId,
    });
  }

  async create(registrationData, session = null) {
    const [registration] = await RegisteredParticipantsModel.create(
      [registrationData],
      { session }
    );

    return registration;
  }

  async getParticipants(hackathonId) {
    return RegisteredParticipantsModel.find({
      hackathon: hackathonId,
    })
      .populate("user", "name email")
      .lean();
  }

  async getParticipantByUser(hackathonId, userId) {
    return RegisteredParticipantsModel.findOne({
      user: userId,
      hackathon: hackathonId,
    })
      .populate("user", "name email avatar")
      .lean();
  }

  async getMyRegistration(userId, hackathonId) {
    return RegisteredParticipantsModel.findOne({
      user: userId,
      hackathon: hackathonId,
    });
  }

  async updateRegistration(registrationId, formData) {
    return RegisteredParticipantsModel.findByIdAndUpdate(
      registrationId,
      {
        $set: {
          formData,
        },
      },
      {
        new: true,
      }
    );
  }

  async updateTeam(registrationId, teamId, session = null) {
    return RegisteredParticipantsModel.findByIdAndUpdate(
      registrationId,
      {
        team: teamId,
      },
      {
        new: true,
        session,
      }
    );
  }

  async leaveTeam(registrationId, session = null) {
    return RegisteredParticipantsModel.findByIdAndUpdate(
      registrationId,
      {
        team: null,
      },
      {
        new: true,
        session,
      }
    );
  }

  async removeTeam(registrationId, session = null) {
    return RegisteredParticipantsModel.findByIdAndUpdate(
      registrationId,
      {
        team: null,
      },
      {
        new: true,
        session,
      }
    );
  }

  async countByHackathon(hackathonId) {
    return RegisteredParticipantsModel.countDocuments({
      hackathon: hackathonId,
    });
  }

  async findUserRegistrations(userId) {
    return RegisteredParticipantsModel.find({
      user: userId,
    })
      .populate({
        path: "hackathon",
        select: "title subTitle slug image status participationType phases",
      })
      .populate({
        path: "team",
        select: "name secretCode members leader",
      })
      .sort({ createdAt: -1 })
      .lean();
  }
}
