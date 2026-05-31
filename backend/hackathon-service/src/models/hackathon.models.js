import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    submissions: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "submissions" }],
      //No. of participants of a hackathon are equal to submissions array no.of elements.
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    submissionStartDate: {
      type: Date,
    },
    submissionEndDate: {
      type: Date,
    },
    votingDate: {
      type: Date,
    },
    refMaterial: {
      type: [String],
    },
    status: {
      type: Boolean,
      default: false,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["Advanced", "Expert", "Intermediate", "Beginner", "Tough"],
      },
    },
    category: {
      type: Array,
    },
    rewards: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    prizeMoney1: {
      type: Number,
    },
    prizeMoney2: {
      type: Number,
    },
    prizeMoney3: {
      type: Number,
    },
    techStackUsed: {
      type: Array,
    },
    numParticipants: {
      type: Number,
      default: 0,
    },
    overview: {
      type: String,
    },
    themes: {
      type: [String],
    },
    FAQs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    teams: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "teams" }],
    },
    aboutUs: {
      type: String,
    },
    projectSubmission: {
      type: [String],
    },
    TandCforHackathon: {
      type: [String],
    },
    evaluationCriteria: {
      type: [String],
    },
    registeredParticipants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "registeredParticipants" },
    ],
    allowedFileTypes: {
      docs: { type: [String], default: ["pdf", "docx", "ppt", "pptx"] },
      images: { type: [String], default: ["jpg", "jpeg", "png"] },
      videos: { type: [String], default: ["mp4"] },
    },
    gallery: [
      {
        type: String,
        required: true,
      },
    ],
    showVoting: {
      type: Boolean,
      default: true,
    },
    showResult: {
      type: Boolean,
      default: true,
    },
    contact: [
      {
        title: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

hackathonSchema.pre(/^find/, async function () {
  const currentTime = new Date();

  await this.model.updateMany(
    {
      startDate: { $lte: currentTime },
      submissionEndDate: { $gte: currentTime },
    },
    {
      status: true,
    }
  );

  await this.model.updateMany(
    {
      submissionEndDate: { $lt: currentTime },
    },
    {
      status: false,
    }
  );
});

hackathonSchema.index({
  startDate: 1,
});

hackathonSchema.index({
  submissionEndDate: 1,
});

hackathonSchema.index({
  status: 1,
});

hackathonSchema.index({
  createdBy: 1,
});

hackathonSchema.index({
  createdAt: -1,
});

const hackathonModel = mongoose.model("hackathons", hackathonSchema);

export default hackathonModel;


// TODO (Future Migration):
// Do not store growing submission references inside Hackathon.
// Source of truth should be Submission collection using:
// Submission.find({ hackathon: hackathonId })
// Kept for backward compatibility with existing data.

// TODO (Future Migration):
// Do not store growing team references inside Hackathon.
// Source of truth should be Team collection using:
// Team.find({ hackathon: hackathonId })
// Kept for backward compatibility with existing data.

// TODO (Future Migration):
// Do not store growing registration references inside Hackathon.
// Source of truth should be RegisteredParticipant collection using:
// RegisteredParticipant.find({ hackathon: hackathonId })
// Kept for backward compatibility with existing data.

// TODO (Future Migration):
// Replace Boolean status with enum:
// "upcoming" | "active" | "completed"
// Boolean status is currently retained for backward compatibility.

// TODO (Performance Improvement):
// Current implementation performs write operations on every read query.
// Replace with BullMQ scheduled job or cron-based status updater.
// Do not remove until replacement is implemented and tested.