import mongoose from "mongoose";
import { getNowUTC } from "../../utils/dateUtils.js";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

export class RegistrationService {
  constructor(
    registrationRepository,
    userRepository,
    hackathonRepository,
    notificationClient,
    logger
  ) {
    this.registrationRepository = registrationRepository;
    this.userRepository = userRepository;
    this.hackathonRepository = hackathonRepository;
    this.notificationClient = notificationClient, 
    this.logger = logger;
  }

  getRegistrationPhase(hackathon, now) {
    const registrationPhase = hackathon.phases?.find(
      (phase) => phase.phaseType === "REGISTRATION" && phase.isActive
    );

    if (!registrationPhase) {
      return null;
    }

    return registrationPhase;
  }

  async registerParticipant({ userId, hackathonId, registrationData }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid hackathon id");
    }

    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    const existingRegistration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (existingRegistration) {
      throw new BadRequestError("User already registered for this hackathon");
    }

    const now = getNowUTC();
    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration phase is not configured");
    }

    if (now < registrationPhase.startDate) {
      throw new BadRequestError("Registration has not started yet");
    }

    if (now > registrationPhase.endDate) {
      throw new BadRequestError("Registration is closed");
    }

    this.logger.info(
      {
        userId,
        hackathonId,
      },
      "Registering participant"
    );

    const { name, email, ...customFields } = registrationData;

    const registrationPayload = {
      ...customFields,

      name: user.name,
      email: user.email,
    };

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const registration = await this.registrationRepository.create(
        {
          user: userId,
          hackathon: hackathonId,

          formData: registrationPayload,
        },
        session
      );

      await this.hackathonRepository.incrementParticipant(hackathonId, session);

      await session.commitTransaction();

      try {
        await this.notificationClient.createNotification({
          userId,
          title: "Registration Successful",
          message: `You have successfully registered for ${hackathon.title}.`,
          type: "HACKATHON",
          actionUrl: `/hackathons/${hackathon.slug}`,
          metadata: {
            hackathonId: hackathon._id.toString(),
          },
        });
      } catch (error) {
        this.logger.error(
          { err: error, userId, hackathonId },
          "Failed to create registration notification"
        );
      }

      this.logger.info(
        {
          registrationId: registration._id,
          hackathonId,
        },
        "Participant registered"
      );

      return registration;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async isRegistered(userId, hackathonId) {
    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    return {
      isRegistered: !!registration,
      //   registration,
    };
  }

  async getMyRegistration(userId, hackathonId) {
    const registration = await this.registrationRepository.getMyRegistration(
      userId,
      hackathonId
    );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    const user = await this.userRepository.getById(userId);

    return {
      ...registration.toObject(),

      formData: {
        name: user.name,
        email: user.email,

        ...registration.formData,
      },
    };
  }

  async updateMyRegistration({ userId, hackathonId, updateData }) {
    const registration = await this.registrationRepository.getMyRegistration(
      userId,
      hackathonId
    );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Hackathon not found");
    }

    const now = getNowUTC();

    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (now < registrationPhase.startDate) {
      throw new BadRequestError("Registration has not started yet");
    }

    if (!registrationPhase) {
      throw new BadRequestError("Registration phase is not configured");
    }

    if (now > registrationPhase.endDate) {
      throw new BadRequestError("Registration is closed");
    }

    let allowedFields = [];

    if (hackathon.registrationForm && hackathon.registrationForm.length) {
      allowedFields = hackathon.registrationForm
        .filter((field) => field.editable)
        .map((field) => field.fieldName);
    }

    const sanitizedUpdate = {};

    const protectedFields = ["name", "email"];

    for (const key of Object.keys(updateData)) {
      if (protectedFields.includes(key.toLowerCase())) {
        continue;
      }

      if (allowedFields.length === 0 || allowedFields.includes(key)) {
        sanitizedUpdate[key] = updateData[key];
      }
    }

    const updatedFormData = {
      ...registration.formData,
      ...sanitizedUpdate,
    };

    console.log("Allowed:", allowedFields);
    console.log("Incoming:", updateData);
    console.log("Sanitized:", sanitizedUpdate);
    console.log("Final:", updatedFormData);
    return this.registrationRepository.updateRegistration(
      registration._id,
      updatedFormData
    );
  }
}
