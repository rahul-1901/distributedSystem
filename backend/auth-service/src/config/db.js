import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URL);

    console.log(
      JSON.stringify({
        level: "INFO",
        service: process.env.SERVICE_NAME,
        message: "MongoDB connected successfully",
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        service: process.env.SERVICE_NAME,
        message: "MongoDB connection failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    );

    process.exit(1);
  }
};
