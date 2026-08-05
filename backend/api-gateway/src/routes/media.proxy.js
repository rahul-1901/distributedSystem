import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const mediaProxy = createProxyMiddleware({
  target: env.MEDIA_SERVICE_URL,
  changeOrigin: true,
  // Uploads are allowed up to 100MB (see media-service's upload.service.js);
  // the previous 30s timeout could abort a large upload mid-transfer on
  // anything slower than a fast connection.
  timeout: 120000,
  proxyTimeout: 120000,
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
