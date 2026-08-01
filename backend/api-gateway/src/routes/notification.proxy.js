import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const notificationProxy = createProxyMiddleware({
  target: env.NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  on: {
    error(err, req, res) {
      console.error("Notification Service Error:", err.message);

      res.status(503).json({
        success: false,
        message: "Notification Service is unavailable",
      });
    },
  }
});
