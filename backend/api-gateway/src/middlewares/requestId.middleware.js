import { v4 as uuid } from "uuid";

export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuid();
  req.requestId = requestId;
  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};