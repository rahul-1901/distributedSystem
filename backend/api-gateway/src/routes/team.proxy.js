import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const teamProxy = createProxyMiddleware({
  target: env.TEAM_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api/teams": "/api/teams",
  },
});