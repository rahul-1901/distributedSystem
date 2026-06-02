import { registrationService } from "../services/registrationService/registration.service.instance.js";

export const registerParticipants = async (req, res, next) => {
  try {
    const registration = await registrationService.registerParticipant({
      userId: req.user._id,

      hackathonId: req.params.hackathonId,

      registrationData: req.body,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      registration,
    });
  } catch (error) {
    next(error);
  }
};

export const isRegistered = async (req, res, next) => {
  try {
    const result = await registrationService.isRegistered(
      req.user._id,
      req.params.hackathonId
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.getMyRegistration(
      req.user._id,
      req.params.hackathonId
    );

    return res.status(200).json({
      success: true,
      registration,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.updateMyRegistration({
      userId: req.user._id,

      hackathonId: req.params.hackathonId,

      updateData: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Registration updated successfully",
      registration,
    });
  } catch (error) {
    next(error);
  }
};
