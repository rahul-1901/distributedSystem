import client from "./client";
import { API } from "./endpoints";

export const AdminAPI = {
  getProfile() {
    return client.get(`${API.ADMIN}/profile`);
  },

  updateProfile(data) {
    return client.patch(
      `${API.ADMIN}/profile`,
      data
    );
  },

  submitVerificationRequest(data) {
    return client.post(
      `${API.ADMIN}/verification-request`,
      data
    );
  },

  getPendingVerificationRequests() {
    return client.get(
      `${API.ADMIN}/verification-requests`
    );
  },

  approveVerification(adminId) {
    return client.post(
      `${API.ADMIN}/admins/${adminId}/approve`
    );
  },

  rejectVerification(adminId, data) {
    return client.post(
      `${API.ADMIN}/admins/${adminId}/reject`,
      data
    );
  },

  getAllAdmins() {
    return client.get(`${API.ADMIN}/admins`);
  },

  deleteAdmin(adminId) {
    return client.delete(`${API.ADMIN}/admins/${adminId}`);
  },
};