import mongoose from "mongoose";

const judgeAssignmentSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hackathons",
      required: true,
    },

    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

judgeAssignmentSchema.index(
  {
    hackathon: 1,
    judge: 1,
  },
  {
    unique: true,
  }
);

judgeAssignmentSchema.index({
  hackathon: 1,
});

judgeAssignmentSchema.index({
  judge: 1,
});

const JudgeAssignmentModel = mongoose.model(
  "judgeAssignments",
  judgeAssignmentSchema
);

export default JudgeAssignmentModel;
