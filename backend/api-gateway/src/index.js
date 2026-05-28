import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
// import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { authProxy } from "./routes/auth.proxy.js";
import { hackathonProxy } from "./routes/hackathon.proxy.js";
import { teamProxy } from "./routes/team.proxy.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(compression());
// app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === "production" ? 500 : 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "api-gateway",
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "api-gateway",
    message: "HackSprint API Gateway running",
  });
});

app.use("/api/auth", authProxy);
app.use("/api/hackathons", hackathonProxy);
app.use("/api/teams", teamProxy);

app.use(notFound);
app.use(errorMiddleware);

const server = app.listen(env.PORT, () => {
  console.log(`API Gateway running on port ${env.PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Closing API Gateway...`);

  server.close(() => {
    console.log("API Gateway closed successfully");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Force closing API Gateway");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException");
});