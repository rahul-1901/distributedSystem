import { logger } from "../utils/logger.js";

export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled error"
  );

  return res.status(
    err.statusCode || 500
  ).json({
    success: false,
    message:
      err.message ||
      "Internal Server Error",
  });
};