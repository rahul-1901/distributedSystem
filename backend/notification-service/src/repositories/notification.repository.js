import Notification from "../models/notification.model.js";

export class NotificationRepository {
  async create(payload) {
    return Notification.create(payload);
  }

  async findByUser(
    userId,
    page = 1,
    limit = 20
  ) {
    return Notification.find({
      userId,
    })
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({
      userId,
      isRead: false,
    });
  }

  async markAsRead(
    notificationId,
    userId
  ) {
    return Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        new: true,
      }
    );
  }

  async markAllAsRead(userId) {
    return Notification.updateMany(
      {
        userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }

  async delete(
    notificationId,
    userId
  ) {
    return Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });
  }

  async deleteManyByUser(userId) {
    return Notification.deleteMany({
      userId,
    });
  }
}