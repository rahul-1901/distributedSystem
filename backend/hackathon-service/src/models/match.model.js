import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hackathons",
      required: true,
    },

    phaseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teams",
      required: true,
    },

    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teams",
      required: true,
    },

    scoreA: {
      type: Number,
      default: null,
    },

    scoreB: {
      type: Number,
      default: null,
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teams",
      default: null,
    },

    status: {
      type: String,
      enum: ["SCHEDULED", "LIVE", "COMPLETED"],
      default: "SCHEDULED",
    },

    order: {
      type: Number,
      default: 0,
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    remindersSent: {
      type: [String],
      enum: ["1h", "15m"],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ hackathon: 1, phaseId: 1, order: 1 });
matchSchema.index({ hackathon: 1, teamA: 1 });
matchSchema.index({ hackathon: 1, teamB: 1 });

// Backs the match-reminder cron's findUpcomingForReminder sweep (runs every
// 5 minutes across every match) — without this it's a full collection scan
// six times an hour, which gets expensive as the match count grows across
// concurrent on-spot events.
matchSchema.index({ status: 1, scheduledAt: 1 });

const MatchModel = mongoose.model("matches", matchSchema);

export default MatchModel;
