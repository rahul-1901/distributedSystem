import mongoose from "mongoose";
import TeamModel from "./team.js";

const mediaSchema = new mongoose.Schema({
  public_id: { type: String, required: true }, // from Cloudinary
  url: { type: String, required: true }, // secure_url
  resource_type: {
    type: String,
    enum: ["image", "video", "raw"],
    required: true,
  },
  format: { type: String }, // jpg, mp4, pdf, etc.
  original_filename: { type: String },
  size: { type: Number }, // bytes
  uploadedAt: { type: Date, default: Date.now },
});

const submissionSchema = new mongoose.Schema({
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    default: null,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
    default: null,
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hackathons",
    required: true,
  },
  repoUrl: {
    type: [String],
    required: true,
  },
  hackathonPoints: {
    type: Number,
    default: 0,
  },
  githubMetadata: {
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    language: { type: String, default: "" },
    updated_at: { type: Date, default: null },
    open_issues: { type: Number, default: 0 },
    watchers: { type: Number, default: 0 },
    description: { type: String, default: "" },
  },

  // 🔹 New fields for docs, images, videos
  docs: [mediaSchema], // array of PDFs or other docs
  images: [mediaSchema], // array of screenshots/images
  videos: [mediaSchema], // array of demo videos

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure either participant OR team is set (not both null)
submissionSchema.pre("validate", function (next) {
  if (!this.participant && !this.team) {
    return next(new Error("Either participant or team must be provided"));
  }
  next();
});

const SubmissionModel = mongoose.model("submissions", submissionSchema);
export default SubmissionModel;
