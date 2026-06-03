import Admin from "../models/admin.model.js";

export class AdminRepository {
  async getById(id) {
    return Admin.findById(id);
  }
}