import client from "./client";
import { API } from "./endpoints";

export const RegistrationAPI = {
  register(hackathonId, registrationData) {
    return client.post(
      `${API.REGISTRATION}/${hackathonId}/register`,
      { registrationData }
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

  updateMyRegistration(hackathonId, registrationData) {
    return client.patch(
      `${API.REGISTRATION}/${hackathonId}/my-registration`,
      { registrationData }
    );
  },
};