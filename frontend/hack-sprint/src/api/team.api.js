import client from "./client";
import { API } from "./endpoints";

export const TeamAPI = {
  createTeam(hackathonId, data) {
    return client.post(
      `${API.TEAM}/${hackathonId}/createTeam`,
      data
    );
  },

  joinTeam(data) {
    return client.post(
      `${API.TEAM}/joinTeam`,
      data
    );
  },

  getTeam(teamId) {
    return client.get(
      `${API.TEAM}/${teamId}`
    );
  },

  searchTeam(secretCode) {
    return client.get(
      `${API.TEAM}/code/${secretCode}`
    );
  },

  getPendingRequests(teamId) {
    return client.get(
      `${API.TEAM}/${teamId}/pending-requests`
    );
  },

  handleRequest(teamId, data) {
    return client.patch(
      `${API.TEAM}/${teamId}/handleRequests`,
      data
    );
  },

  cancelJoinRequest(teamId) {
    return client.delete(
      `${API.TEAM}/${teamId}/revert-request`
    );
  },

  leaveTeam(teamId) {
    return client.delete(
      `${API.TEAM}/${teamId}/leaveTeam`
    );
  },

  removeMember(teamId, userId) {
    return client.delete(
      `${API.TEAM}/${teamId}/members/${userId}`
    );
  },

  updateTeam(teamId, data) {
    return client.patch(
      `${API.TEAM}/${teamId}/updateTeam`,
      data
    );
  },

  deleteTeam(teamId) {
    return client.delete(
      `${API.TEAM}/${teamId}/deleteTeam`
    );
  },
};