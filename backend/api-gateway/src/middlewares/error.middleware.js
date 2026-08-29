import { Sentry } from "../config/sentry.js";

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: process.env.SERVICE_NAME,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    })
  );

  if (statusCode >= 500) {
    Sentry.captureException(err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    },
    timestamp: new Date().toISOString(),
  });
};
