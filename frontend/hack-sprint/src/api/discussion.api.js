import client from "./client";
import { API } from "./endpoints";

export const DiscussionAPI = {
  getMessages(hackathonId, params = {}) {
    return client.get(`${API.DISCUSSION}/${hackathonId}`, { params });
  },
  createMessage(hackathonId, { content, parentMessage }) {
    return client.post(`${API.DISCUSSION}/${hackathonId}`, {
      content,
      parentMessage,
    });
  },
  getReplies(messageId) {
    return client.get(`${API.DISCUSSION}/replies/${messageId}`);
  },
  deleteMessage(messageId) {
    return client.delete(`${API.DISCUSSION}/${messageId}`);
  },
};
