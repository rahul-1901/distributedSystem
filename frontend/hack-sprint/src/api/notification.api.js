import client from "./client";
import { API } from "./endpoints";

export const NotificationAPI = {
  getNotifications(params = {}) {
    return client.get(API.NOTIFICATION, {
      params,
    });
  },

  getUnreadCount() {
    return client.get(
      `${API.NOTIFICATION}/unread-count`
    );
  },

  markAsRead(notificationId) {
    return client.patch(
      `${API.NOTIFICATION}/${notificationId}/read`
    );
  },

  markAllAsRead() {
    return client.patch(
      `${API.NOTIFICATION}/read-all`
    );
  },

  deleteNotification(notificationId) {
    return client.delete(
      `${API.NOTIFICATION}/${notificationId}`
    );
  },
};