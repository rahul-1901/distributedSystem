import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
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

    phaseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    submissionData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "UNDER_REVIEW", "REJECTED"],
      default: "SUBMITTED",
    },
    resultStatus: {
      type: String,
      enum: ["NONE", "SHORTLISTED", "RUNNER_UP", "WINNER"],
      default: "NONE",
    },
    hackathonPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    
    reviewCount: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.pre("validate", function (next) {
  if (!this.participant && !this.team) {
    return next(new Error("Either participant or team must be provided"));
  }
});

submissionSchema.index(
  {
    participant: 1,
    hackathon: 1,
    phaseId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      participant: {
        $exists: true,
      },
    },
  }
);

submissionSchema.index(
  {
    team: 1,
    hackathon: 1,
    phaseId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      team: {
        $exists: true,
      },
    },
  }
);

submissionSchema.index({
  hackathon: 1,
});

submissionSchema.index({
  hackathon: 1,
  phaseId: 1,
});

submissionSchema.index({
  hackathon: 1,
  status: 1,
});

submissionSchema.index({
  hackathon: 1,
  hackathonPoints: -1,
});

const SubmissionModel = mongoose.model("submissions", submissionSchema);

export default SubmissionModel;
