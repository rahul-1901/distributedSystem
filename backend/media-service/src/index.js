import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import multer from "multer";
import uploadRoutes from "./routes/upload.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./utils/logger.js";

dotenv.config();

if (
  !process.env.AWS_REGION ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_S3_BUCKET_NAME
) {
  throw new Error("AWS configuration missing");
}

if (!process.env.INTERNAL_SERVICE_SECRET) {
  throw new Error("INTERNAL_SERVICE_SECRET is missing");
}

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "media-service",
    message: "Media Service running",
  });
});

app.use("/uploads", uploadRoutes);

app.use(errorHandler);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  logger.error(
    {
      err: error,
    },
    "Unhandled error"
  );

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5005;

const server = app.listen(PORT, () => {
  logger.info(`Media service running on port ${PORT}`);
});

const shutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown`);

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Force shutting down server");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.fatal(
    {
      err: error,
    },
    "Uncaught Exception"
  );

  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal(
    {
      reason,
    },
    "Unhandled Rejection"
  );

  process.exit(1);
});
