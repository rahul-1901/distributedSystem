import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    name: {
      type: String,
      required: true,
    },
    teams: [
      {
        hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "hackathons" },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      },
    ],
    role: {
      type: String,
      enum: ["participant"],
      default: "participant",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: "",
      select: false
    },
    resetPasswordExpiresAt: Date,
    verificationToken: {
      type: String,
      default: "",
      select: false
    },
    gitHubLink: {
      type: String,
    },
    streaks: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    contactNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\+?[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    leaderOfHackathons: [
      { type: mongoose.Schema.Types.ObjectId, ref: "hackathons" },
    ],
    registeredHackathons: [
      { type: mongoose.Schema.Types.ObjectId, ref: "hackathons" },
    ],
    submittedHackathons: [
      { type: mongoose.Schema.Types.ObjectId, ref: "hackathons" },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "hackathons" }],
    education: [
      {
        institute: {
          type: String,
          required: true,
        },
        passOutYear: {
          type: String,
          required: true,
        },
        department: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
      },
    ],
    connectedApps: [
      {
        appName: { type: String, required: true },
        appURL: { type: String, required: true },
      },
    ],
    languages: [
      {
        language: { type: String, required: true },
      },
    ],
    skills: [
      {
        skill: { type: String, required: true },
      },
    ],
    coins: {
      type: Number,
      default: 0,
    },
    hackathonPoints: {
      type: Number,
      default: 0,
    },
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

userSchema.virtual("submissions", {
  ref: "submissions",
  localField: "_id",
  foreignField: "participant",
});
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });
const UserModel = mongoose.model("users", userSchema);

export default UserModel;
