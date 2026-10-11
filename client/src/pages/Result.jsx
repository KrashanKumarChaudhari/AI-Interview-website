
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check whether the user is logged in.
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  // Do not render the result page for logged-out users.
  if (!userId) return null;

  // Read interview results passed by Interview.jsx.
  const {
    score,
    answers,
    questions,
    evaluations,
    totalAIScore,
    maxAIScore,
  } = location.state || {};

  const totalQuestions = questions?.length || 0;

  const answeredQuestions =
    answers?.filter((answer) => answer.trim() !== "").length || 0;

  // Prefer the detailed AI score when it is available.
  const hasAIScore =
    typeof totalAIScore === "number" &&
    typeof maxAIScore === "number" &&
    maxAIScore > 0;

  const percentage = hasAIScore
    ? Math.max(0, Math.min(100, Math.round((totalAIScore / maxAIScore) * 100)))
    : totalQuestions
      ? Math.max(0, Math.min(100, Math.round(((score || 0) / totalQuestions) * 100)))
      : 0;

  // Determine the performance category.
  let performanceLevel = "Needs Improvement";

  if (percentage >= 80) performanceLevel = "Excellent";
  else if (percentage >= 60) performanceLevel = "Good";
  else if (percentage >= 40) performanceLevel = "Average";

  // Provide an overall summary based on the final percentage.
  let feedback = "Keep practicing and work on improving your interview answers.";

  if (percentage >= 80) {
    feedback = "Excellent performance! Your answers show strong understanding.";
  } else if (percentage >= 60) {
    feedback = "Good performance! Keep practicing to improve further.";
  } else if (percentage >= 40) {
    feedback =
      "Average performance. Focus on accuracy and completeness in your answers.";
  }

  // Safely retrieve per-question AI evaluation details.
  const getAIScore = (index) => evaluations?.[index]?.score ?? null;
  const getAIFeedback = (index) => evaluations?.[index]?.feedback ?? null;

  return (
    <main className="result-page">
      <div className="result-shell">
        {/* Dashboard heading */}
        <header className="result-header">
          <div className="result-eyebrow">
            <span className="result-live-dot" />
            AI INTERVIEW ANALYTICS
          </div>

          <h1>
            Interview <span>Results</span>
          </h1>

          <p>Your performance report is ready. Review your results and improve your next attempt.</p>
        </header>

        {/* Main score dashboard */}
        <section className="result-overview">
          <div className="result-score-panel">
            <div className="result-score-ring" style={{ "--score": `${percentage}%` }}>
              <div className="result-score-inner">
                <strong>{percentage}%</strong>
                <span>Overall Score</span>
              </div>
            </div>

            <div className="result-performance-label">{performanceLevel}</div>
            <p className="result-summary">{feedback}</p>
          </div>

          <div className="result-stats">
            <div className="result-stat-card">
              <span className="result-stat-icon">◎</span>
              <span className="result-stat-label">Questions</span>
              <strong>{totalQuestions}</strong>
              <small>Total interview questions</small>
            </div>

            <div className="result-stat-card">
              <span className="result-stat-icon">✓</span>
              <span className="result-stat-label">Answered</span>
              <strong>{answeredQuestions}<span className="result-stat-total"> / {totalQuestions}</span></strong>
              <small>Questions attempted</small>
            </div>

            <div className="result-stat-card result-stat-wide">
              <span className="result-stat-icon">✧</span>
              <span className="result-stat-label">
                {hasAIScore ? "Gemini AI Score" : "Interview Score"}
              </span>
              <strong>
                {hasAIScore
                  ? `${totalAIScore} / ${maxAIScore}`
                  : `${score ?? 0} / ${totalQuestions}`}
              </strong>
              <div className="result-progress-track">
                <div
                  className="result-progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Explain how the AI evaluated answers */}
        {hasAIScore && (
          <section className="result-ai-info">
            <div className="result-ai-icon">✧</div>
            <div>
              <h2>AI Evaluation Report</h2>
              <p>
                Gemini AI evaluated your answers for correctness, relevance,
                completeness, technical understanding and clarity.
              </p>
            </div>
            <span className="result-ai-badge">AI ANALYZED</span>
          </section>
        )}

        {/* Individual question and answer feedback */}
        <section className="result-answers-section">
          <div className="result-section-heading">
            <div>
              <span className="result-section-kicker">DETAILED ANALYSIS</span>
              <h2>Your Answers</h2>
              <p>Review your responses and AI feedback question by question.</p>
            </div>
            <span className="result-count-badge">
              {totalQuestions} Questions
            </span>
          </div>

          {answers?.length ? (
            answers.map((answer, index) => {
              const aiScore = getAIScore(index);
              const aiFeedback = getAIFeedback(index);
              const isSkipped = answer.trim() === "";

              return (
                <article className="result-answer-card" key={index}>
                  <div className="result-question-top">
                    <span className="result-question-number">
                      QUESTION {String(index + 1).padStart(2, "0")}
                    </span>

                    {aiScore !== null && (
                      <span
                        className={`result-answer-score ${
                          aiScore >= 7
                            ? "score-high"
                            : aiScore >= 4
                              ? "score-medium"
                              : "score-low"
                        }`}
                      >
                        AI Score: {aiScore}/10
                      </span>
                    )}

                    {aiScore === null && (
                      <span className="result-pending-badge">
                        {isSkipped ? "Skipped" : "Submitted"}
                      </span>
                    )}
                  </div>

                  <h3>{questions?.[index] || "Interview question"}</h3>

                  <div className="result-user-answer">
                    <span className="result-answer-label">YOUR ANSWER</span>
                    <p>
                      {isSkipped
                        ? "Not answered — this question was skipped."
                        : answer}
                    </p>
                  </div>

                  {aiScore !== null && (
                    <div className="result-feedback-panel">
                      <div className="result-feedback-title">
                        <span>✧</span> AI Feedback
                      </div>
                      <p>{aiFeedback || "No feedback available for this answer."}</p>
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <div className="result-empty-state">
              <span>◎</span>
              <h3>No answer details available</h3>
              <p>Complete an interview to see your detailed answer analysis here.</p>
            </div>
          )}
        </section>

        {/* Navigation actions */}
        <footer className="result-footer">
          <p>READY FOR YOUR NEXT CHALLENGE?</p>
          <div className="result-actions">
            <button
              className="result-btn result-btn-secondary"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>

            <button
              className="result-btn result-btn-primary"
              onClick={() => navigate("/interview-setup")}
            >
              Restart Interview <span>↗</span>
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default Result;
