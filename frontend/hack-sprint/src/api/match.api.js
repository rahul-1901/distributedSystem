import client from "./client";
import { API } from "./endpoints";

export const MatchAPI = {
  // public
  getRoundMatchesPublic(hackathonId, phaseId) {
    return client.get(
      `${API.HACKATHON}/${hackathonId}/on-spot/phases/${phaseId}/matches`
    );
  },
  getStandings(hackathonId) {
    return client.get(`${API.HACKATHON}/${hackathonId}/on-spot/standings`);
  },

  // admin
  createMatch(hackathonId, data) {
    return client.post(
      `${API.HACKATHON}/admin/hackathons/${hackathonId}/matches`,
      data
    );
  },
  getRoundMatchesAdmin(hackathonId, phaseId) {
    return client.get(
      `${API.HACKATHON}/admin/hackathons/${hackathonId}/phases/${phaseId}/matches`
    );
  },
  updateMatchScore(hackathonId, matchId, data) {
    return client.patch(
      `${API.HACKATHON}/admin/hackathons/${hackathonId}/matches/${matchId}/score`,
      data
    );
  },
  updateMatchStatus(hackathonId, matchId, status) {
    return client.patch(
      `${API.HACKATHON}/admin/hackathons/${hackathonId}/matches/${matchId}/status`,
      { status }
    );
  },
  updateMatchSchedule(hackathonId, matchId, scheduledAt) {
    return client.patch(
      `${API.HACKATHON}/admin/hackathons/${hackathonId}/matches/${matchId}/schedule`,
      { scheduledAt }
    );
  },
  reorderMatches(hackathonId, phaseId, orderedMatchIds) {
    return client.patch(
      `${API.HACKATHON}/admin/hackathons/${hackathonId}/phases/${phaseId}/matches/reorder`,
      { orderedMatchIds }
    );
  },
  deleteMatch(hackathonId, matchId) {
    return client.delete(
      `${API.HACKATHON}/admin/hackathons/${hackathonId}/matches/${matchId}`
    );
  },
};
