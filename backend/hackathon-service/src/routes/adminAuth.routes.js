import express from "express";
import { adminGoogleLogin } from "../controllers/adminAuth.controller.js";
// import { redirectToGoogle } from "../utils/googleAuth.utils.js";

const router = express.Router();

router.get("/google", adminGoogleLogin);
// router.get("/google", redirectToGoogle);

// router.get("/google/callback", adminGoogleLogin);
export default router;
