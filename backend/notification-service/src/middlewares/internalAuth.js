import { UnauthorizedError } from "../errors/UnauthorizedError.js";

export const verifyInternalService = (req, res, next) => {
  const secret = req.headers["x-service-secret"];

  if (!secret || secret !== process.env.INTERNAL_SERVICE_SECRET) {
    return next(new UnauthorizedError("Unauthorized internal request"));
  }

  next();
};
