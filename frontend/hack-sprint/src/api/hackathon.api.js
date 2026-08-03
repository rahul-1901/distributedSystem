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
    return client.get(`${API.HACKATHON}/wishlist/check/${hackathonId}`);
  },

  // Registration
  register(hackathonId, registrationData) {
    return client.post(`${API.HACKATHON}/${hackathonId}/register`, { registrationData });
  },
  getRegistrationStatus(hackathonId) {
    return client.get(`${API.HACKATHON}/${hackathonId}/registration-status`);
  },
  getMyRegistration(hackathonId) {
    return client.get(`${API.HACKATHON}/${hackathonId}/my-registration`);
  },
  updateMyRegistration(hackathonId, updateData) {
    return client.patch(`${API.HACKATHON}/${hackathonId}/my-registration`, updateData);
  },
  getMyRegistrations() {
    return client.get(`${API.HACKATHON}/my-registrations`);
  },

  // Teams
  createTeam(hackathonId, teamName) {
    return client.post(`${API.HACKATHON}/teams/${hackathonId}/createTeam`, { teamName });
  },
  joinTeam(secretCode) {
    return client.post(`${API.HACKATHON}/teams/joinTeam`, { secretCode });
  },
  handleTeamRequest(teamId, userId, action) {
    return client.patch(`${API.HACKATHON}/teams/${teamId}/handleRequests`, { userId, action });
  },
  getPendingRequests(teamId) {
    return client.get(`${API.HACKATHON}/teams/${teamId}/pending-requests`);
  },
  getTeamById(teamId) {
    return client.get(`${API.HACKATHON}/teams/${teamId}`);
  },
  searchTeamByCode(secretCode) {
    return client.get(`${API.HACKATHON}/teams/code/${secretCode}`);
  },
  cancelJoinRequest(teamId) {
    return client.delete(`${API.HACKATHON}/teams/${teamId}/revert-request`);
  },
  leaveTeam(teamId) {
    return client.delete(`${API.HACKATHON}/teams/${teamId}/leaveTeam`);
  },
  removeTeamMember(teamId, userId) {
    return client.delete(`${API.HACKATHON}/teams/${teamId}/members/${userId}`);
  },
  updateTeam(teamId, teamName) {
    return client.patch(`${API.HACKATHON}/teams/${teamId}/updateTeam`, { teamName });
  },
  deleteTeam(teamId) {
    return client.delete(`${API.HACKATHON}/teams/${teamId}/deleteTeam`);
  },

  // Submissions
  createSubmission(hackathonId, { title, description, submissionData }) {
    return client.post(`${API.HACKATHON}/${hackathonId}/creatSubmission`, {
      title,
      description,
      submissionData,
    });
  },
  updateSubmission(hackathonId, submissionId, { title, description, submissionData }) {
    return client.patch(`${API.HACKATHON}/${hackathonId}/submission/${submissionId}`, {
      title,
      description,
      submissionData,
    });
  },
  getMySubmission(hackathonId) {
    return client.get(`${API.HACKATHON}/${hackathonId}/my-submission`);
  },
  getSubmissionById(submissionId) {
    return client.get(`${API.HACKATHON}/submissions/${submissionId}`);
  },

  // Voting
  toggleVote(submissionId) {
    return client.post(`${API.HACKATHON}/${submissionId}/vote`);
  },
  getVotingSubmissions(hackathonId) {
    return client.get(`${API.HACKATHON}/${hackathonId}/voting-submissions`);
  },
  getVotingSubmissionById(submissionId) {
    return client.get(`${API.HACKATHON}/voting-submissions/${submissionId}`);
  },

  // Admin (unchanged)
  createHackathon(data) {
    return client.post(`${API.HACKATHON}/admin/createHackathon`, data);
  },
  updateHackathon(id, data) {
    return client.patch(`${API.HACKATHON}/admin/updateHackathon/${id}`, data);
  },
  submitForApproval(id) {
    return client.post(`${API.HACKATHON}/admin/${id}/submitHackathon`);
  },
  getPendingHackathons(config = {}) {
    return client.get(`${API.HACKATHON}/admin/pendingHackathon`, config);
  },
  getAllHackathonsForController(config = {}) {
    return client.get(`${API.HACKATHON}/admin/all-hackathons`, config);
  },
  approveHackathon(id) {
    return client.post(`${API.HACKATHON}/admin/${id}/approveHackathon`);
  },
  rejectHackathon(id, data) {
    return client.post(`${API.HACKATHON}/admin/${id}/rejectHackathon`, data);
  },
  deleteHackathon(id) {
    return client.delete(`${API.HACKATHON}/admin/${id}/deleteHackathon`);
  },
  getMyHackathons(config = {}) {
    return client.get(`${API.HACKATHON}/admin/my-hackathons`, config);
  },
  getHackathonAdminOverview(id) {
    return client.get(`${API.HACKATHON}/admin/hackathons/${id}/overview`);
  },
  getEntitySubmissions(hackathonId, entityType, entityId) {
    return client.get(
      `${API.HACKATHON}/admin/hackathons/${hackathonId}/submissions/${entityType}/${entityId}`
    );
  },
};