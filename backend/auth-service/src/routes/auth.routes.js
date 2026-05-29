import express from "express";
import {
  googleLogin,
  login,
  resetPassword,
  sendResetLink,
  signup,
  verifyEmail
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { signupSchema, loginSchema } from "../validations/auth.validation.js";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

const router = express.Router();

router.post("/signup", limiter, validate(signupSchema), signup);
router.get("/verify-email", limiter, verifyEmail);
router.post("/send-reset-link", limiter, sendResetLink);
router.post("/reset-password", limiter, resetPassword);
router.post("/login", limiter, validate(loginSchema), login);
router.get("/google", limiter, googleLogin);

export default router;
