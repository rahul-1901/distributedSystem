import RegisteredParticipantsModel from "../models/registeredParticipants.js";

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
}
