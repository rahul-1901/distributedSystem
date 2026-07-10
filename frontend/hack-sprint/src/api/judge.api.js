import client from "./client";
import { API } from "./endpoints";

export const JudgeAPI = {
  assignJudge(hackathonId, data) {
    return client.post(
      `${API.JUDGE}/hackathons/${hackathonId}/judges`,
      data
    );
  },

  getHackathonJudges(hackathonId) {
    return client.get(
      `${API.JUDGE}/hackathons/${hackathonId}/judges`
    );
  },

  removeJudge(hackathonId, judgeId) {
    return client.delete(
      `${API.JUDGE}/hackathons/${hackathonId}/judges/${judgeId}`
    );
  },

  getAssignedHackathons() {
    return client.get(
      `${API.JUDGE}/judges/assigned-hackathons`
    );
  },

  getHackathonSubmissions(hackathonId) {
    return client.get(
      `${API.JUDGE}/judges/hackathons/${hackathonId}/submissions`
    );
  },

  getSubmissionDetails(submissionId) {
    return client.get(
      `${API.JUDGE}/judges/submissions/${submissionId}`
    );
  },

  reviewSubmission(submissionId, data) {
    return client.post(
      `${API.JUDGE}/judges/submissions/${submissionId}/review`,
      data
    );
  },

  getSubmissionReviews(submissionId) {
    return client.get(
      `${API.JUDGE}/judges/submissions/${submissionId}/reviews`
    );
  },
};