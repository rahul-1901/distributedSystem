import { adminService } from "../services/adminService/admin.service.instance.js";

export const getProfile = async (req, res, next) => {
  try {
    const admin = await adminService.getProfile(req.admin._id);

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const admin = await adminService.updateProfile(req.admin._id, req.body);

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const submitVerificationRequest = async (req, res, next) => {
  try {
    const result = await adminService.submitVerificationRequest(
      req.admin._id,
      req.body.verificationDocument
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPendingVerificationRequests = async (req, res, next) => {
  try {
    const requests = await adminService.getPendingVerificationRequests(
      req.admin._id
    );

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const approveVerification = async (req, res, next) => {
  try {
    const admin = await adminService.approveVerification({
      controllerId: req.admin._id,
      adminId: req.params.adminId,
    });

    return res.status(200).json({
      success: true,
      message: "Verification approved",
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectVerification = async (req, res, next) => {
  try {
    const admin = await adminService.rejectVerification({
      controllerId: req.admin._id,

      adminId: req.params.adminId,

      remarks: req.body.remarks,
    });

    return res.status(200).json({
      success: true,
      message: "Verification rejected",
      admin,
    });
  } catch (error) {
    next(error);
  }
};
