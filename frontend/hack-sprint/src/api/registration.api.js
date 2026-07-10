import client from "./client";
import { API } from "./endpoints";

export const RegistrationAPI = {
  register(hackathonId, data) {
    return client.post(
      `${API.REGISTRATION}/${hackathonId}/register`,
      data
    );
  },

  getRegistrationStatus(hackathonId) {
    return client.get(
      `${API.REGISTRATION}/${hackathonId}/registration-status`
    );
  },

  getMyRegistration(hackathonId) {
    return client.get(
      `${API.REGISTRATION}/${hackathonId}/my-registration`
    );
  },

  updateMyRegistration(hackathonId, data) {
    return client.patch(
      `${API.REGISTRATION}/${hackathonId}/my-registration`,
      data
    );
  },
};