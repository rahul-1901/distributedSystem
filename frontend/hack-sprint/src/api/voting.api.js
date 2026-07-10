import client from "./client";
import { API } from "./endpoints";

export const VotingAPI = {
  toggleVote(submissionId) {
    return client.post(
      `${API.VOTING}/${submissionId}/vote`
    );
  },

  getVotingSubmissions(hackathonId) {
    return client.get(
      `${API.VOTING}/${hackathonId}/voting-submissions`
    );
  },

  getVotingSubmission(submissionId) {
    return client.get(
      `${API.VOTING}/voting-submissions/${submissionId}`
    );
  },
};