import { notificationService } from "../services/notification.service.intance.js";

export const createNotification =
  async (
    req,
    res,
    next
  ) => {
    try {
      const notification =
        await notificationService.createNotification(
          req.body
        );

      return res.status(201).json({
        success: true,
        notification,
      });
    } catch (error) {
      next(error);
    }
  };

export const getNotifications =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        page = 1,
        limit = 20,
      } = req.query;

      const notifications =
        await notificationService.getNotifications(
          req.user._id,
          page,
          limit
        );

      return res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error) {
      next(error);
    }
  };

export const getUnreadCount =
  async (
    req,
    res,
    next
  ) => {
    try {
      const count =
        await notificationService.getUnreadCount(
          req.user._id
        );

      return res.status(200).json({
        success: true,
        ...count,
      });
    } catch (error) {
      next(error);
    }
  };

export const markAsRead =
  async (
    req,
    res,
    next
  ) => {
    try {
      const notification =
        await notificationService.markAsRead(
          req.params.id,
          req.user._id
        );

      return res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      next(error);
    }
  };

export const markAllAsRead =
  async (
    req,
    res,
    next
  ) => {
    try {
      await notificationService.markAllAsRead(
        req.user._id
      );

      return res.status(200).json({
        success: true,
        message:
          "Notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteNotification =
  async (
    req,
    res,
    next
  ) => {
    try {
      await notificationService.deleteNotification(
        req.params.id,
        req.user._id
      );

      return res.status(200).json({
        success: true,
        message:
          "Notification deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

export const clearAllNotifications =
  async (
    req,
    res,
    next
  ) => {
    try {
      await notificationService.clearAllNotifications(
        req.user._id
      );

      return res.status(200).json({
        success: true,
        message:
          "Notifications cleared",
      });
    } catch (error) {
      next(error);
    }
  };