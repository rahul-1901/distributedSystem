import client from "./client";
import { API } from "./endpoints";

export const NotificationAPI = {
  getNotifications(params = {}, asAdmin = false) {
    return client.get(API.NOTIFICATION, {
      params,
      adminRequest: asAdmin,
    });
  },

  getUnreadCount(asAdmin = false) {
    return client.get(`${API.NOTIFICATION}/unread-count`, {
      adminRequest: asAdmin,
    });
  },

  markAsRead(notificationId, asAdmin = false) {
    return client.patch(
      `${API.NOTIFICATION}/${notificationId}/read`,
      {},
      { adminRequest: asAdmin }
    );
  },

  markAllAsRead(asAdmin = false) {
    return client.patch(
      `${API.NOTIFICATION}/read-all`,
      {},
      { adminRequest: asAdmin }
    );
  },

  deleteNotification(notificationId, asAdmin = false) {
    return client.delete(`${API.NOTIFICATION}/${notificationId}`, {
      adminRequest: asAdmin,
    });
  },
};