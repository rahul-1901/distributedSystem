import mongoose from "mongoose";
import TeamModel from "./team.js";

const mediaSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
  resource_type: {
    type: String,
    enum: ["image", "video", "raw"],
    required: true,
  },
  format: { type: String },
  original_filename: { type: String },
  size: { type: Number },
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
  docs: [mediaSchema],
  images: [mediaSchema],
  videos: [mediaSchema],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

submissionSchema.pre("validate", function (next) {
  if (!this.participant && !this.team) {
    return next(new Error("Either participant or team must be provided"));
  }
  next();
});
submissionSchema.index({ hackathon: 1 });
submissionSchema.index({ hackathon: 1, hackathonPoints: -1 });

const SubmissionModel = mongoose.model("submissions", submissionSchema);
export default SubmissionModel;
