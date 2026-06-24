import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import hackathonRoutes from "./routes/hackathon.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { connectRedis } from "./config/redis.js";
import uploadRoutes from "./routes/upload.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import discussionRoutes from "./routes/discussion.routes.js";
import multer from "multer";

dotenv.config();

if (
  !process.env.AWS_REGION ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_S3_BUCKET_NAME
) {
  throw new Error("AWS configuration missing");
}

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "hackathon-service",
    message: "Hackathon Service running",
  });
});

app.use("/", hackathonRoutes);
app.use("/uploads", uploadRoutes);
app.use("/api/discussions",discussionRoutes);
app.use("/platform/admin", adminRoutes);
app.use("/admin/auth", adminAuthRoutes);

app.use(errorHandler);
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

await connectDB();
await connectRedis();

app.listen(process.env.PORT, () => {
  console.log(`Hackathon service running on port ${process.env.PORT}`);
});
