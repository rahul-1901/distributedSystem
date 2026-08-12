import express from "express";
import { verifyAuth } from "../middlewares/userAuth.js";
import { verifyInternalService } from "../middlewares/internalAuth.js";
import {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/internal", verifyInternalService, createNotification);
router.get("/", verifyAuth, getNotifications);
router.get("/unread-count", verifyAuth, getUnreadCount);
router.patch("/:id/read", verifyAuth, markAsRead);
router.patch("/read-all", verifyAuth, markAllAsRead);
router.delete("/clear-all", verifyAuth, clearAllNotifications);
router.delete("/:id", verifyAuth, deleteNotification);

export default router;
