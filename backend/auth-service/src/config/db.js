import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URL);

    logger.info(
      {
        service: process.env.SERVICE_NAME,
      },
      "MongoDB connected successfully"
    );
  } catch (error) {
    logger.error(
      {
        service: process.env.SERVICE_NAME,
        err: error,
      },
      "MongoDB connection failed"
    );

    process.exit(1);
  }
};
