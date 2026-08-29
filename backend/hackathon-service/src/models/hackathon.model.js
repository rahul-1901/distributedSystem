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
    allowedExtensions: {
      type: [String],
      default: [],
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
      enum: [
        "REGISTRATION",
        "SUBMISSION",
        "REVIEW",
        "ANNOUNCEMENT",
        "MATCH_ROUND",
      ],
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

    reminderSent: {
      type: Boolean,
      default: false,
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    qualificationRule: {
      type: {
        type: String,
        enum: ["NONE", "TOP_N", "THRESHOLD"],
        default: "NONE",
      },
      value: {
        type: Number,
        default: null,
      },
    },

    judgingConfig: {
      minScore: {
        type: Number,
      },
      maxScore: {
        type: Number,
      },
    },

    concludedAt: {
      type: Date,
      default: null,
    },

    concludedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null,
    },
  },
  {
    _id: true,
  }
);

const hackathonSchema = new mongoose.Schema(
  {
    image: {
      url: {
        type: String,
        default: "",
      },
      key: {
        type: String,
        default: "",
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subTitle: {
      type: String,
    },
    venue: {
      type: String,
      trim: true,
      default: "",
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
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_APPROVAL", "REJECTED", "APPROVED"],
      default: "DRAFT",
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
      type: [
        {
          url: String,
          key: String,
        },
      ],
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
        key: String,
        format: String,
        size: Number,
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
      ref: "admins",
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
    eventFormat: {
      type: String,
      enum: ["SUBMISSION", "ON_SPOT"],
      default: "SUBMISSION",
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
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

hackathonSchema.virtual("lifecycleStatus").get(function () {
  if (this.status !== "APPROVED") {
    return this.status;
  }

  const now = new Date();

  if (!this.phases || this.phases.length === 0) {
    return "UPCOMING";
  }

  const earliest = new Date(
    Math.min(...this.phases.map((p) => new Date(p.startDate)))
  );

  const latest = new Date(
    Math.max(...this.phases.map((p) => new Date(p.endDate)))
  );

  if (now < earliest) {
    return "UPCOMING";
  }

  if (now >= earliest && now <= latest) {
    return "ACTIVE";
  }

  return "COMPLETED";
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

hackathonSchema.pre("save", async function () {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(`${this.title}-${Date.now()}`, {
      lower: true,
      strict: true,
    });
  }
});

const hackathonModel = mongoose.model("hackathons", hackathonSchema);

export default hackathonModel;
