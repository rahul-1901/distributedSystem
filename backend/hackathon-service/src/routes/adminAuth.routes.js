import express from "express";
import { adminGoogleLogin } from "../controllers/adminAuth.controller.js";

const router = express.Router();

router.get("/google", adminGoogleLogin);

export default router;
