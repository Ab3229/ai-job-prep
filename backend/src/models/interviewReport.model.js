const mongoose = require("mongoose");

const interviewReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    resumeText: {
      type: String,
      required: true,
    },

    selfDescription: {
      type: String,
      default: "",
    },

    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    technicalQuestions: [
      {
        question: {
          type: String,
          required: true,
        },
        intension: {
          type: String,
        },
        answer: {
          type: String,
        },
        _id: false,
      },
    ],

    behavioralQuestions: [
      {
        question: {
          type: String,
          required: true,
        },
        intension: {
          type: String,
        },
        answer: {
          type: String,
        },
        _id: false,
      },
    ],

    skillGaps: [
      {
        skill: {
          type: String,
          required: true,
        },
        severity: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        _id: false,
      },
    ],

    preparationPlan: [
      {
        focus: {
          type: String,
        },
        task: {
          type: String,
        },
        day: {
          type: String,
        },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = InterviewReport;
