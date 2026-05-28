import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Auth Service MongoDB connected");
  } catch (error) {
    console.error("Auth Service MongoDB connection failed:", error.message);
    process.exit(1);
  }
};