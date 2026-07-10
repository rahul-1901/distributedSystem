import client from "./client";
import { API } from "./endpoints";

export const HackathonAPI = {
  getHackathons(params = {}) {
    return client.get(`${API.HACKATHON}/hackathon`, { params });
  },

  getHackathon(id) {
    return client.get(`${API.HACKATHON}/${id}`);
  },

  getHackathonBySlug(slug) {
    return client.get(`${API.HACKATHON}/slug/${slug}`);
  },

  getResults(id) {
    return client.get(`${API.HACKATHON}/${id}/results`);
  },

  getGallery(hackathonId) {
    return client.get(`${API.HACKATHON}/${hackathonId}/gallery`);
  },

  toggleWishlist(data) {
    return client.post(`${API.HACKATHON}/wishlist/toggle`, data);
  },

  getWishlist() {
    return client.get(`${API.HACKATHON}/wishlist`);
  },

  checkWishlist(hackathonId) {
    return client.get(
      `${API.HACKATHON}/wishlist/check/${hackathonId}`
    );
  },

  createHackathon(data) {
    return client.post(
      `${API.HACKATHON}/admin/createHackathon`,
      data
    );
  },

  updateHackathon(id, data) {
    return client.patch(
      `${API.HACKATHON}/admin/updateHackathon/${id}`,
      data
    );
  },

  submitForApproval(id) {
    return client.post(
      `${API.HACKATHON}/admin/${id}/submitHackathon`
    );
  },

  getPendingHackathons() {
    return client.get(
      `${API.HACKATHON}/admin/pendingHackathon`
    );
  },

  approveHackathon(id) {
    return client.post(
      `${API.HACKATHON}/admin/${id}/approveHackathon`
    );
  },

  rejectHackathon(id, data) {
    return client.post(
      `${API.HACKATHON}/admin/${id}/rejectHackathon`,
      data
    );
  },

  deleteHackathon(id) {
    return client.delete(
      `${API.HACKATHON}/admin/${id}/deleteHackathon`
    );
  },

  getOrganizerHackathon(id) {
    return client.get(
      `${API.HACKATHON}/admin/hackathons/${id}`
    );
  },

  getMyHackathons() {
    return client.get(
      `${API.HACKATHON}/admin/my-hackathons`
    );
  },
};