import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "auth-service",
    message: "Auth Service running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/", authRoutes); //through api-gateway

connectDB();

app.listen(env.PORT, () => {
  console.log(`Auth service running on port ${env.PORT}`);
});