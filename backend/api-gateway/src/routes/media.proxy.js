import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const mediaProxy = createProxyMiddleware({
  target: env.MEDIA_SERVICE_URL,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  on: {
    error(err, req, res) {
      console.error("Media Service Error:", err.message);

      res.status(503).json({
        success: false,
        message: "Media Service is unavailable",
      });
    },
  }
});
