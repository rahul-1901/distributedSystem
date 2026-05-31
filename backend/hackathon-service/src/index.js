import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import hackathonRoutes from "./routes/hackathon.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { connectRedis } from "./config/redis.js";

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

app.use(errorHandler);

await connectDB();
await connectRedis();

app.listen(process.env.PORT, () => {
  console.log(`Hackathon service running on port ${process.env.PORT}`);
});
