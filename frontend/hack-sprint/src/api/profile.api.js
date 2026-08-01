import client from "./client";
import { API } from "./endpoints";

export const ProfileAPI = {
  getMyProfile() {
    return client.get(`${API.PROFILE}/me`);
  },
  updateProfile(data) {
    return client.patch(`${API.PROFILE}/me`, data);
  },
  getPublicProfile(userName) {
    return client.get(`${API.PROFILE}/${userName}`);
  },
  addEducation(payload) {
    return client.post(`${API.PROFILE}/me/education`, payload);
  },
  updateEducation(id, payload) {
    return client.patch(`${API.PROFILE}/me/education/${id}`, payload);
  },
  removeEducation(id) {
    return client.delete(`${API.PROFILE}/me/education/${id}`);
  },
  addConnectedApp(payload) {
    return client.post(`${API.PROFILE}/me/apps`, payload);
  },
  updateConnectedApp(id, payload) {
    return client.patch(`${API.PROFILE}/me/apps/${id}`, payload);
  },
  removeConnectedApp(id) {
    return client.delete(`${API.PROFILE}/me/apps/${id}`);
  },
  updateSkills(skills) {
    return client.put(`${API.PROFILE}/me/skills`, { skills });
  },
  updateLanguages(languages) {
    return client.put(`${API.PROFILE}/me/languages`, { languages });
  },
  updateAvatar(image) {
    return client.patch(`${API.PROFILE}/me/avatar`, { image });
  },
};
