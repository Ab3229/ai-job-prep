require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// -------------------------
// ZOD SCHEMA (matches InterviewReport mongoose model)
// -------------------------

const interviewReportSchema = z.object({
  technicalQuestions: z
    .array(
      z.object({
        question: z.string().describe("The technical question that can be asked in the interview"),
        intension: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach"),
      })
    )
    .describe("Technical questions that can be asked in the interview along with their intention and answer"),

  behavioralQuestions: z
    .array(
      z.object({
        question: z.string().describe("The behavioral question that can be asked in the interview"),
        intension: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach"),
      })
    )
    .describe("Behavioral questions that can be asked in the interview along with their intention and answer"),

  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("The severity of this skill gap, i.e. how critical it is for the job"),
      })
    )
    .describe("List of skill gaps in the candidate's profile along with their severity"),

  preparationPlan: z
    .array(
      z.object({
        day: z.string().describe("The day number in the preparation plan, as a string e.g. 'Day 1'"),
        focus: z.string().describe("The main topic or skill to focus on that day"),
        task: z.string().describe("Specific task(s) to complete on that day"),
      })
    )
    .describe("Day-wise preparation plan for the candidate before the interview"),
});

// -------------------------
// SCHEMA SANITIZER
// -------------------------
// Gemini's `responseSchema` accepts only a restricted OpenAPI-style subset.
// zod-to-json-schema adds keys like "additionalProperties" (and, in other
// configs, "$schema" / "definitions" / "$ref") that Gemini's Schema proto
// does NOT recognize. Sending them causes a 400 error such as:
//   "Invalid JSON payload received. Unknown name 'additionalProperties'"
// This walks the whole schema tree and strips every unsupported key,
// not just the top-level one.
function sanitizeSchemaForGemini(schema) {
  if (Array.isArray(schema)) {
    return schema.map(sanitizeSchemaForGemini);
  }
  if (schema && typeof schema === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(schema)) {
      if (
        key === "additionalProperties" ||
        key === "$schema" ||
        key === "definitions" ||
        key === "$ref" ||
        key === "$id"
      ) {
        continue; // drop unsupported / irrelevant keys
      }
      cleaned[key] = sanitizeSchemaForGemini(value);
    }
    return cleaned;
  }
  return schema;
}

function normalizeReport(report) {
  const normalizeQuestions = (items) =>
    (Array.isArray(items) ? items : []).map((item) => {
      if (typeof item === "string") {
        return { question: item, intension: "", answer: "" };
      }

      return {
        question: String(item?.question || "Question not provided"),
        intension: String(item?.intension || item?.intention || ""),
        answer: String(item?.answer || ""),
      };
    });

  const normalizeSkillGaps = (items) =>
    (Array.isArray(items) ? items : []).map((item) => {
      if (typeof item === "string") {
        return { skill: item, severity: "medium" };
      }

      return {
        skill: String(item?.skill || "Skill not provided"),
        severity: ["low", "medium", "high"].includes(item?.severity)
          ? item.severity
          : "medium",
      };
    });

  const normalizePreparationPlan = (items) =>
    (Array.isArray(items) ? items : []).map((item, index) => {
      if (typeof item === "string") {
        const parts = item.split(":");
        const day = parts.shift()?.trim() || `Day ${index + 1}`;
        return {
          day,
          focus: parts.join(":").trim() || item,
          task: "Review this topic and practice related interview questions.",
        };
      }

      return {
        day: String(item?.day || `Day ${index + 1}`),
        focus: String(item?.focus || "General interview preparation"),
        task: String(item?.task || "Review this topic and practice related interview questions."),
      };
    });

  return {
    technicalQuestions: normalizeQuestions(report?.technicalQuestions),
    behavioralQuestions: normalizeQuestions(report?.behavioralQuestions),
    skillGaps: normalizeSkillGaps(report?.skillGaps),
    preparationPlan: normalizePreparationPlan(report?.preparationPlan),
  };
}

function extractJsonText(text) {
  if (typeof text !== "string") return "";

  const trimmed = text.trim();
  if (!trimmed) return "";

  // Accept markdown-wrapped JSON (```json ... ```), or raw JSON.
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  return trimmed;
}

// -------------------------
// BASIC GEMINI FUNCTION
// -------------------------

async function invokeGeminiAi() {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: "Explain backend development",
  });

  return response.text;
}

// -------------------------
// INTERVIEW REPORT
// -------------------------

async function generateInterviewReport({ resume, selfDeclaration, jobDescription }) {
  if (!resume || !jobDescription) {
    throw new Error(
      "generateInterviewReport: resume and jobDescription are required."
    );
  }

  const prompt = `
You are an expert technical interviewer.

Analyze the following candidate information:

RESUME:
${resume}

SELF DECLARATION:
${selfDeclaration}

JOB DESCRIPTION:
${jobDescription}

Generate a complete interview report based on:
1. Candidate's resume
2. Candidate's self declaration
3. Job description
4. Candidate's technical skills
5. Candidate's projects

The report should include technical questions, behavioral questions, skill gaps compared to the job description, and a day-wise preparation plan.

Return ONLY valid JSON with this exact top-level shape:
{
  "technicalQuestions": [{ "question": "string", "intension": "string", "answer": "string" }],
  "behavioralQuestions": [{ "question": "string", "intension": "string", "answer": "string" }],
  "skillGaps": [{ "skill": "string", "severity": "low|medium|high" }],
  "preparationPlan": [{ "day": "Day 1", "focus": "string", "task": "string" }]
}
`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { temperature: 0.3 },
    });
  } catch (err) {
    throw err;
  }

  try {
    const jsonText = extractJsonText(response.text);
    if (!jsonText) {
      throw new Error("Empty response from model");
    }
    return normalizeReport(JSON.parse(jsonText));
  } catch (err) {
    throw new Error(
      `generateInterviewReport: model did not return valid JSON. ${err.message}`
    );
  }
}

// -------------------------
// EXPORT
// -------------------------

module.exports = {
  invokeGeminiAi,
  generateInterviewReport,
};