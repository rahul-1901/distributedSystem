import client from "./client";
import { API } from "./endpoints";

export const SubmissionAPI = {
  createSubmission(hackathonId, data) {
    return client.post(
      `${API.SUBMISSION}/${hackathonId}/creatSubmission`,
      data
    );
  },

  getMySubmission(hackathonId) {
    return client.get(
      `${API.SUBMISSION}/${hackathonId}/my-submission`
    );
  },

  getSubmission(submissionId) {
    return client.get(
      `${API.SUBMISSION}/submissions/${submissionId}`
    );
  },

  updateSubmission(hackathonId, submissionId, data) {
    return client.patch(
      `${API.SUBMISSION}/${hackathonId}/submission/${submissionId}`,
      data
    );
  },
};