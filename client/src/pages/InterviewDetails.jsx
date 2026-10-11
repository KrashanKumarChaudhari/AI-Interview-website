
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function InterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Safely read the logged-in user's ID.
  let userId = null;

  try {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );
    userId = storedUser?.id;
  } catch {
    userId = null;
  }

  // Redirect logged-out users to the Login page.
  useEffect(() => {
    if (!userId || !localStorage.getItem("token")) {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  // Fetch the selected interview attempt.
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setLoading(false);
      return;
    }

    const loadInterviewDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/interviews/details/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Interview details not found."
          );
        }

        setInterview(data);
      } catch (err) {
        console.error("Interview details error:", err);
        setError(
          err.message || "Failed to load interview details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInterviewDetails();
  }, [id, userId]);

  // All hooks are called before any conditional return.
  if (!userId || !localStorage.getItem("token")) {
    return null;
  }

  if (loading) {
    return (
      <main className="details-page">
        <div className="details-state-card">
          <div className="details-loader" />
          <h2>Loading interview report</h2>
          <p>Preparing your AI evaluation and answers...</p>
        </div>
      </main>
    );
  }

  if (error || !interview) {
    return (
      <main className="details-page">
        <div className="details-state-card">
          <div className="details-state-icon">!</div>
          <span className="details-eyebrow">REPORT UNAVAILABLE</span>
          <h2>Unable to load interview</h2>
          <p>
            {error || "The requested interview record was not found."}
          </p>
          <button
            className="details-primary-btn"
            onClick={() => navigate("/profile")}
          >
            ← Back to Profile
          </button>
        </div>
      </main>
    );
  }

  // Ensure optional database fields are treated as arrays.
  const questions = Array.isArray(interview.questions)
    ? interview.questions
    : [];

  const answers = Array.isArray(interview.answers)
    ? interview.answers
    : [];

  const evaluations = Array.isArray(interview.evaluations)
    ? interview.evaluations
    : [];

  const score = Number(interview.score) || 0;
  const totalQuestions = Number(interview.total_questions) || 0;

  const percentage =
    totalQuestions > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((score / totalQuestions) * 100))
        )
      : 0;

  const completedDate = interview.created_at
    ? new Date(interview.created_at).toLocaleString()
    : "Date unavailable";

  return (
    <main className="details-page">
      <div className="details-background-glow details-glow-one" />
      <div className="details-background-glow details-glow-two" />

      <div className="details-dashboard">
        {/* Page header */}
        <header className="details-header">
          <div>
            <span className="details-eyebrow">
              <span className="details-live-dot" />
              AI MOCK INTERVIEW SYSTEM
            </span>

            <h1>Interview Report</h1>

            <p>
              Review your performance, answers and personalized AI feedback.
            </p>
          </div>

          <button
            className="details-back-btn"
            onClick={() => navigate("/profile")}
          >
            ← Profile
          </button>
        </header>

        {/* Main score and interview summary */}
        <section className="details-overview">
          <div className="details-score-card">
            <span className="details-card-label">OVERALL SCORE</span>

            <div
              className="details-score-ring"
              style={{ "--score-progress": `${percentage}%` }}
              role="img"
              aria-label={`Overall score: ${percentage}%`}
            >
              <div className="details-score-ring-inner">
                <strong>{percentage}%</strong>
                <span>PERFORMANCE</span>
              </div>
            </div>

            <h2>{score} / {totalQuestions}</h2>
            <p>Interview score</p>
          </div>

          <div className="details-info-card">
            <span className="details-card-label">INTERVIEW SUMMARY</span>

            <div className="details-info-row">
              <span className="details-info-icon">⌘</span>
              <div>
                <span>Target Role</span>
                <strong>{interview.role || "Not specified"}</strong>
              </div>
            </div>

            <div className="details-info-row">
              <span className="details-info-icon">◷</span>
              <div>
                <span>Experience Level</span>
                <strong>
                  {interview.experience || "Not specified"}
                </strong>
              </div>
            </div>

            <div className="details-info-row">
              <span className="details-info-icon">◇</span>
              <div>
                <span>Interview Type</span>
                <strong>
                  {interview.interview_type || "Not specified"}
                </strong>
              </div>
            </div>

            <div className="details-info-row">
              <span className="details-info-icon">▦</span>
              <div>
                <span>Completed On</span>
                <strong>{completedDate}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* AI evaluation introduction */}
        {evaluations.length > 0 && (
          <section className="details-ai-banner">
            <div className="details-ai-icon">✧</div>
            <div>
              <h2>AI Evaluation</h2>
              <p>
                Your answers were evaluated for correctness, relevance,
                completeness, technical understanding and clarity.
              </p>
            </div>
            <span className="details-ai-badge">AI ANALYZED</span>
          </section>
        )}

        {/* Question-by-question review */}
        <section className="details-questions-section">
          <div className="details-section-heading">
            <div>
              <span className="details-card-label">DETAILED REVIEW</span>
              <h2>Questions & Answers</h2>
              <p>Examine each response and the feedback it received.</p>
            </div>

            <span className="details-question-count">
              {questions.length} QUESTIONS
            </span>
          </div>

          {questions.length === 0 ? (
            <div className="details-empty-state">
              <div className="details-empty-icon">◇</div>
              <h3>No question data available</h3>
              <p>
                This interview record does not contain saved questions.
                This can happen with older interview attempts.
              </p>
            </div>
          ) : (
            <div className="details-question-list">
              {questions.map((question, index) => {
                const evaluation = evaluations[index];
                const rawScore = Number(evaluation?.score);
                const hasScore =
                  evaluation?.score !== undefined &&
                  evaluation?.score !== null &&
                  evaluation?.score !== "" &&
                  Number.isFinite(rawScore);

                const answer = answers[index];
                const answerText =
                  typeof answer === "string" && answer.trim()
                    ? answer
                    : "No answer provided.";

                const scoreClass = !hasScore
                  ? "details-score-neutral"
                  : rawScore >= 7
                  ? "details-score-good"
                  : rawScore >= 4
                  ? "details-score-medium"
                  : "details-score-low";

                return (
                  <article
                    className="details-question-card"
                    key={`${index}-${String(question).slice(0, 30)}`}
                  >
                    <div className="details-question-top">
                      <span className="details-question-number">
                        Q{index + 1}
                      </span>

                      {hasScore && (
                        <span
                          className={`details-question-score ${scoreClass}`}
                        >
                          AI Score: {rawScore} / 10
                        </span>
                      )}
                    </div>

                    <h3>{question}</h3>

                    <div className="details-answer-block">
                      <span className="details-answer-label">
                        YOUR ANSWER
                      </span>
                      <p>{answerText}</p>
                    </div>

                    {evaluation ? (
                      <div
                        className={`details-feedback-block ${scoreClass}`}
                      >
                        <div className="details-feedback-heading">
                          <span>✧ AI FEEDBACK</span>
                          {hasScore && (
                            <strong>{rawScore} / 10</strong>
                          )}
                        </div>

                        <p>
                          {evaluation.feedback ||
                            "No feedback available for this answer."}
                        </p>
                      </div>
                    ) : (
                      <div className="details-no-feedback">
                        No AI evaluation was saved for this question.
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Return navigation */}
        <footer className="details-footer">
          <p>
            Review your feedback and use it to prepare for your next attempt.
          </p>

          <div className="details-footer-actions">
            <button
              className="details-secondary-btn"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>

            <button
              className="details-primary-btn"
              onClick={() => navigate("/profile")}
            >
              ← Back to Profile
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default InterviewDetails;
