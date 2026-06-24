import { Router } from "express";
import { verifyAuth } from "../middlewares/userAuth.js";

import {
  createMessage,
  getMessages,
  getReplies,
  deleteMessage,
} from "../controllers/discussion.controller.js";

const router = Router();

router.get("/:hackathonId", getMessages);
router.post("/:hackathonId", verifyAuth, createMessage);
router.get("/replies/:messageId", getReplies);
router.delete("/:messageId", verifyAuth, deleteMessage);

export default router;
