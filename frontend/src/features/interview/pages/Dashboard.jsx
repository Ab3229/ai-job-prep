import { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  fetchInterviewReports,
  generateInterviewReport,
} from "../service/interview.api";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, handleLogout, loading: authLoading } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchInterviewReports();
        const loadedReports = data.reports ?? [];
        setReports(loadedReports);
        setActiveReport(loadedReports[0] ?? null);
      } catch {
        setError("Failed to load previous reports");
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await generateInterviewReport({
        jobDescription,
        resumeText,
        selfDescription,
      });
      const report = data.report;
      setReports((prev) => [report, ...prev]);
      setActiveReport(report);
      setJobDescription("");
      setResumeText("");
      setSelfDescription("");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to generate interview report"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Interview Prep AI</h1>
          <p>Welcome, {user?.name || user?.email}</p>
        </div>
        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
          disabled={authLoading}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <section className="form-section">
          <h2>Generate Report</h2>
          <p className="section-subtitle">
            Paste the job description and your resume to get tailored interview
            questions and a prep plan.
          </p>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleSubmit} className="report-form">
            <label>
              Job Description
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={5}
                required
              />
            </label>

            <label>
              Resume
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={6}
                required
              />
            </label>

            <label>
              Self Description (optional)
              <textarea
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
                placeholder="Briefly describe your experience and goals..."
                rows={3}
              />
            </label>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </form>
        </section>

        <section className="reports-section">
          <div className="reports-heading">
            <h2>Your Reports</h2>
            {activeReport && (
              <button
                type="button"
                className="download-btn"
                onClick={() => downloadInterviewReport(activeReport)}
              >
                Download Report
              </button>
            )}
          </div>

          {reports.length === 0 ? (
            <p className="empty-text">No reports yet. Generate your first one.</p>
          ) : (
            <ul className="report-list">
              {reports.map((report) => (
                <li key={report._id}>
                  <button
                    type="button"
                    className={
                      activeReport?._id === report._id
                        ? "report-item active"
                        : "report-item"
                    }
                    onClick={() => setActiveReport(report)}
                  >
                    <span>
                      {report.jobDescription.slice(0, 60)}
                      {report.jobDescription.length > 60 ? "..." : ""}
                    </span>
                    <small>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {activeReport && <ReportDetails report={activeReport} />}
        </section>
      </main>
    </div>
  );
}

function ReportDetails({ report }) {
  return (
    <div className="report-detail">
      <ReportSection title="Technical Questions" items={report.technicalQuestions}>
        {(item) => (
          <>
            <strong>{item.question}</strong>
            {item.intension && <p><b>What it evaluates:</b> {item.intension}</p>}
            {item.answer && <p><b>How to answer:</b> {item.answer}</p>}
          </>
        )}
      </ReportSection>

      <ReportSection title="Behavioral Questions" items={report.behavioralQuestions}>
        {(item) => (
          <>
            <strong>{item.question}</strong>
            {item.intension && <p><b>What it evaluates:</b> {item.intension}</p>}
            {item.answer && <p><b>How to answer:</b> {item.answer}</p>}
          </>
        )}
      </ReportSection>

      <ReportSection title="Skill Gaps" items={report.skillGaps}>
        {(item) => (
          <>
            <strong>{item.skill}</strong>
            <span className={`severity ${item.severity || "medium"}`}>
              {item.severity || "medium"} priority
            </span>
          </>
        )}
      </ReportSection>

      <ReportSection title="Preparation Plan" items={report.preparationPlan}>
        {(item) => (
          <>
            <strong>{item.day}</strong>
            <p><b>Focus:</b> {item.focus}</p>
            <p><b>Task:</b> {item.task}</p>
          </>
        )}
      </ReportSection>
    </div>
  );
}

function ReportSection({ title, items = [], children }) {
  return (
    <section className="report-group">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="section-empty">No items were returned for this section.</p>
      ) : (
        <ul>{items.map((item, index) => <li key={`${title}-${index}`}>{children(item)}</li>)}</ul>
      )}
    </section>
  );
}

function downloadInterviewReport(report) {
  const lines = [
    "INTERVIEW PREPARATION REPORT",
    `Created: ${new Date(report.createdAt || Date.now()).toLocaleString()}`,
    "",
    "JOB DESCRIPTION",
    report.jobDescription || "Not provided",
    "",
    "TECHNICAL QUESTIONS",
    ...formatQuestionSection(report.technicalQuestions),
    "",
    "BEHAVIORAL QUESTIONS",
    ...formatQuestionSection(report.behavioralQuestions),
    "",
    "SKILL GAPS",
    ...((report.skillGaps || []).map(
      (item, index) => `${index + 1}. ${item.skill} (${item.severity || "medium"} priority)`
    )),
    "",
    "PREPARATION PLAN",
    ...((report.preparationPlan || []).map(
      (item) => `${item.day}: ${item.focus}\nTask: ${item.task}`
    )),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `interview-report-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatQuestionSection(items = []) {
  return items.flatMap((item, index) => [
    `${index + 1}. ${item.question}`,
    `What it evaluates: ${item.intension || "Not provided"}`,
    `How to answer: ${item.answer || "Not provided"}`,
    "",
  ]);
}
