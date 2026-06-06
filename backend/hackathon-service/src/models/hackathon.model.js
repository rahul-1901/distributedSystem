import mongoose from "mongoose";
import slugify from "slugify";

const submissionFieldSchema = new mongoose.Schema(
  {
    fieldName: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    fieldType: {
      type: String,
      enum: [
        "TEXT",
        "TEXTAREA",

        "URL",

        "DOCUMENT",
        "IMAGE",
        "VIDEO",

        "MULTI_DOCUMENT",
        "MULTI_IMAGE",
        "MULTI_VIDEO",
      ],
      required: true,
    },

    required: {
      type: Boolean,
      default: false,
    },

    editable: {
      type: Boolean,
      default: true,
    },

    maxFiles: {
      type: Number,
      default: 1,
    },

    maxSizeMB: {
      type: Number,
      default: 50,
    },
  },
  {
    _id: true,
  }
);

const phaseSchema = new mongoose.Schema(
  {
    phaseName: {
      type: String,
      required: true,
      trim: true,
    },

    phaseType: {
      type: String,
      enum: ["REGISTRATION", "SUBMISSION", "REVIEW", "ANNOUNCEMENT"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    submissionForm: {
      type: [submissionFieldSchema],
      default: [],
    },
  },
  {
    _id: true,
  }
);

const hackathonSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subTitle: {
      type: String,
    },
    description: {
      type: String,
    },

    detailsContent: {
      type: String,
      trim: true,
      maxlength: 100000,
      default: "",
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

    status: {
      type: Boolean,
      default: false,
    },

    category: {
      type: [String],
      default: [],
    },
    techStacks: {
      type: [String],
      default: [],
    },
    gallery: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: {
        values: ["Advanced", "Expert", "Intermediate", "Beginner", "Tough"],
      },
    },
    numParticipants: {
      type: Number,
      default: 0,
    },
    contacts: [
      {
        label: String,

        type: {
          type: String,
          enum: ["EMAIL", "PHONE", "LINKEDIN", "DISCORD", "WEBSITE", "OTHER"],
        },

        value: String,
      },
    ],
    resources: [
      {
        title: String,
        url: String,
      },
    ],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    votingConfig: {
      enabled: {
        type: Boolean,
        default: false,
      },

      allowSelfVote: {
        type: Boolean,
        default: false,
      },

      onlyParticipantsCanVote: {
        type: Boolean,
        default: true,
      },

      voteWeight: {
        type: Number,
        default: 20,
        min: 0,
        max: 100,
      },
    },
    prizes: [
      {
        title: String,
        description: String,
        amount: {
          type: Number,
          min: 0,
        },
      },
    ],
    showResult: {
      type: Boolean,
      default: true,
    },
    publicLeaderboardLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    judgingConfig: {
      minScore: {
        type: Number,
        default: 0,
      },

      maxScore: {
        type: Number,
        default: 100,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    phases: {
      type: [phaseSchema],
      default: [],
    },
    registrationForm: [
      {
        fieldName: {
          type: String,
          required: true,
        },

        label: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: [
            "text",
            "email",
            "number",
            "textarea",
            "select",
            "checkbox",
            "url",
          ],
          default: "text",
        },

        required: {
          type: Boolean,
          default: false,
        },

        editable: {
          type: Boolean,
          default: true,
        },

        options: [String],
      },
    ],
    participationType: {
      type: String,
      enum: ["INDIVIDUAL", "TEAM"],
      default: "INDIVIDUAL",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    maxTeamSize: {
      type: Number,
      default: 1,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: "",
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

hackathonSchema.index({
  featured: 1,
});

hackathonSchema.index({
  tags: 1,
});

const hackathonModel = mongoose.model("hackathons", hackathonSchema);

export default hackathonModel;
