import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const hackathonProxy = createProxyMiddleware({
  target: env.MEDIA_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api/media": "/api/media",
  },
});