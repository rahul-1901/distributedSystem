import { BadRequestError } from "../../errors/BadRequestError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

export class AdminService {
  constructor(adminRepository, logger) {
    this.adminRepository = adminRepository;

    this.logger = logger;
  }

  async getProfile(adminId) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    return admin;
  }

  async updateProfile(adminId, payload) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    const {
      organizationName,
      organizerType,
      contactNumber,
      country,
      website,
      linkedin,
      bio,
      avatar,
    } = payload;

    if (!organizationName || !contactNumber || !country) {
      throw new BadRequestError(
        "organizationName, contactNumber and country are required"
      );
    }

    const updatedAdmin = await this.adminRepository.updateProfile(adminId, {
      organizationName,
      organizerType,
      contactNumber,
      country,
      website,
      linkedin,
      bio,
      avatar,

      profileCompleted: true,
    });

    return updatedAdmin;
  }

  async submitVerificationRequest(adminId, verificationDocument) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    if (!admin.profileCompleted) {
      throw new ForbiddenError("Complete profile first");
    }

    if (admin.verificationStatus === "PENDING") {
      throw new BadRequestError("Verification request already submitted");
    }

    if (!verificationDocument) {
      throw new BadRequestError("Verification document required");
    }

    admin.verificationDocument = verificationDocument;

    admin.verificationStatus = "PENDING";

    await this.adminRepository.save(admin);

    return {
      success: true,
      message: "Verification request submitted",
    };
  }

  async ensureVerifiedOrganizer(adminId) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    if (!admin.profileCompleted) {
      throw new ForbiddenError("Complete your profile first");
    }

    if (!admin.isVerified) {
      throw new ForbiddenError("Organizer verification required");
    }

    return admin;
  }

  async getPendingVerificationRequests(controllerId) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.adminRepository.getPendingVerificationRequests();
  }

  async approveVerification({ controllerId, adminId }) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    if (admin.verificationStatus !== "PENDING") {
      throw new BadRequestError("No pending verification request");
    }

    return this.adminRepository.updateVerificationStatus(adminId, {
      isVerified: true,

      verificationStatus: "APPROVED",

      verifiedAt: new Date(),

      verifiedBy: controllerId,
    });
  }

  async rejectVerification({ controllerId, adminId, remarks }) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    if (admin.verificationStatus !== "PENDING") {
      throw new BadRequestError("No pending verification request");
    }

    return this.adminRepository.updateVerificationStatus(adminId, {
      isVerified: false,

      verificationStatus: "REJECTED",

      verificationRemarks: remarks || "",

      verifiedAt: null,

      verifiedBy: null,
    });
  }
}
