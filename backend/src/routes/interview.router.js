const express = require("express");
const interviewRouter = express.Router();
const { authMiddleware } = require("./auth.router");
const { generateInterviewReport } = require("../service/ai.service");
const InterviewReport = require("../models/interviewReport.model");

interviewRouter.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { jobDescription, resumeText, selfDescription } = req.body;

    if (!jobDescription || !resumeText) {
      return res
        .status(400)
        .json({ message: "jobDescription and resumeText are required" });
    }

    const aiReport = await generateInterviewReport({
      resume: resumeText,
      selfDeclaration: selfDescription || "Not provided",
      jobDescription,
    });

    const report = await InterviewReport.create({
      user: req.user.id,
      jobDescription,
      resumeText,
      selfDescription: selfDescription || "",
      technicalQuestions: aiReport.technicalQuestions || [],
      behavioralQuestions: aiReport.behavioralQuestions || [],
      skillGaps: aiReport.skillGaps || [],
      preparationPlan: aiReport.preparationPlan || [],
    });

    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({
      message: "Failed to generate interview report",
      error: err.message,
    });
  }
});

interviewRouter.get("/reports", authMiddleware, async (req, res) => {
  try {
    const reports = await InterviewReport.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = { interviewRouter };
