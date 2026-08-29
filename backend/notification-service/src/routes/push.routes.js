import express from "express";
import { verifyAuth } from "../middlewares/userAuth.js";
import { getVapidPublicKey, subscribe, unsubscribe } from "../controllers/push.controller.js";

const router = express.Router();

router.get("/vapid-public-key", getVapidPublicKey);
router.post("/subscribe", verifyAuth, subscribe);
router.post("/unsubscribe", verifyAuth, unsubscribe);

export default router;
