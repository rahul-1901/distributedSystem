import client from "./client";
import { API } from "./endpoints";

export const ProfileAPI = {
  getMyProfile() {
    return client.get(`${API.PROFILE}/me`);
  },

  updateProfile(data) {
    return client.patch(`${API.PROFILE}/me`, data);
  },

  getPublicProfile(username) {
    return client.get(`${API.PROFILE}/${username}`);
  },

  addEducation(data) {
    return client.post(`${API.PROFILE}/me/education`, data);
  },

  updateEducation(id, data) {
    return client.patch(`${API.PROFILE}/me/education/${id}`, data);
  },

  removeEducation(id) {
    return client.delete(`${API.PROFILE}/me/education/${id}`);
  },

  addConnectedApp(data) {
    return client.post(`${API.PROFILE}/me/apps`, data);
  },

  updateConnectedApp(id, data) {
    return client.patch(`${API.PROFILE}/me/apps/${id}`, data);
  },

  removeConnectedApp(id) {
    return client.delete(`${API.PROFILE}/me/apps/${id}`);
  },

  updateSkills(skills) {
    return client.put(`${API.PROFILE}/me/skills`, {
      skills,
    });
  },

  updateLanguages(languages) {
    return client.put(`${API.PROFILE}/me/languages`, {
      languages,
    });
  },

  updateAvatar(formData) {
    return client.patch(
      `${API.PROFILE}/me/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};