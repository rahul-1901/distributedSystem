import Admin from "../models/admin.model.js";

export class AdminRepository {
  async getById(id) {
    return Admin.findById(id);
  }

  async getByEmail(email) {
    return Admin.findOne({
      email,
    });
  }

  async create(adminData) {
    return Admin.create(adminData);
  }

  async save(admin) {
    return admin.save();
  }

  async updateProfile(adminId, updateData) {
    return Admin.findByIdAndUpdate(adminId, updateData, {
      new: true,
    });
  }

  async getPendingVerificationRequests() {
    return Admin.find({
      verificationStatus: "PENDING",
    }).sort({
      createdAt: -1,
    });
  }

  async updateVerificationStatus(adminId, updateData) {
    return Admin.findByIdAndUpdate(adminId, updateData, {
      new: true,
    });
  }
}
