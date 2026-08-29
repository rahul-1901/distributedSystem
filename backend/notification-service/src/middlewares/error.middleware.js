import { logger } from "../utils/logger.js";
import { Sentry } from "../config/sentry.js";

// This service's controllers already throw typed errors (BadRequestError,
// NotFoundError, ...) with a `statusCode`, expecting a final handler to turn
// them into a JSON response — but no such handler was ever registered here,
// so every one of them was falling through to Express's default handler
// (a generic HTML 500) instead of the intended status/message.
export const errorHandler = (err, req, res, next) => {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
      requestId: req.requestId,
    },
    "Unhandled error"
  );

  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    Sentry.captureException(err);
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
