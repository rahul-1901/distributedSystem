import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5001,
  MONGO_URL: process.env.MONGO_URL,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

  SECRET_KEY: process.env.SECRET_KEY,
  JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME || "7d",

  FRONTEND_URL: process.env.FRONTEND_URL,

  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SENDER_EMAIL: process.env.SENDER_EMAIL,

  EMAIL: process.env.EMAIL,
  EMAIL_PASS: process.env.EMAIL_PASS,

  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
};