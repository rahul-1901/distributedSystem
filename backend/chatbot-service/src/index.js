import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { env } from "./config/env.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { metricsHandler, metricsMiddleware } from "./metrics/metrics.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(helmet());

app.use(compression());

const allowedOrigins = [
  env.FRONTEND_URL,
  "https://hacksprint.devluplabs.tech",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(metricsMiddleware);
app.use(requestIdMiddleware);
app.use((req, res, next) => {
  try {
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        requestId: req.requestId,
      },
      "Incoming Request"
    );
  } catch (err) {
    console.error("Logger failed", err);
  }

  next();
});

app.get("/metrics", metricsHandler);
app.get("/health", (req, res) => {
  return res.json({
    success: true,
    service: "chatbot-service",
    message: "Chatbot Service running",
  });
});

app.use("/", chatbotRoutes);

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info(`Chatbot service running on port ${env.PORT}`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received. Closing Chatbot Service...`);

  server.close(() => {
    logger.info("Chatbot Service closed successfully");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Force closing Chatbot Service");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception");
  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled Rejection");
  shutdown("UNHANDLED_REJECTION");
});
