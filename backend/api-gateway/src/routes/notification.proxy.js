import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const hackathonProxy = createProxyMiddleware({
  target: env.NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api/notification": "/api/notification",
  },
});