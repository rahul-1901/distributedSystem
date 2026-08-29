import client from "./client";
import { API } from "./endpoints";

export const PushAPI = {
  getVapidPublicKey() {
    return client.get(`${API.NOTIFICATION}/push/vapid-public-key`);
  },

  subscribe(subscription, asAdmin = false) {
    return client.post(
      `${API.NOTIFICATION}/push/subscribe`,
      { subscription },
      { adminRequest: asAdmin }
    );
  },

  unsubscribe(endpoint, asAdmin = false) {
    return client.post(
      `${API.NOTIFICATION}/push/unsubscribe`,
      { endpoint },
      { adminRequest: asAdmin }
    );
  },
};
