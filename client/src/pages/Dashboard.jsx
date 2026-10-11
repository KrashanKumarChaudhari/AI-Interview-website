
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  // Store dashboard statistics and recent interview history.
  const [stats, setStats] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check whether a user is logged in.
    let user;

    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!user?.id) {
      navigate("/login");
      return;
    }

    // Fetch statistics and interview history from the backend.
    const loadDashboard = async () => {
      try {
        const statsResponse = await fetch(
          `http://localhost:5000/api/interviews/stats/${user.id}`
        );

        const statsData = await statsResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message || "Failed to load statistics."
          );
        }

        setStats(statsData);

        const interviewResponse = await fetch(
          `http://localhost:5000/api/interviews/${user.id}`
        );

        const interviewData = await interviewResponse.json();

        if (!interviewResponse.ok) {
          throw new Error(
            interviewData.message || "Failed to load interview history."
          );
        }

        // Display only the five most recent attempts.
        setInterviews(
          Array.isArray(interviewData)
            ? interviewData.slice(0, 5)
            : []
        );
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  // Show a loading screen while the API requests are running.
  if (loading) {
    return (
      <main className="dashboard-state">
        <div className="dashboard-loader" />
        <p>Initializing your AI dashboard...</p>
        <span>Loading your interview performance</span>
      </main>
    );
  }

  // Show an error screen if the backend request fails.
  if (error) {
    return (
      <main className="dashboard-state">
        <div className="dashboard-state-icon">!</div>
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button
          className="dashboard-primary-btn"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </main>
    );
  }

  // Provide safe defaults if the statistics response is empty.
  const totalInterviews = Number(stats?.total_interviews) || 0;
  const averageScore = Number(stats?.average_score) || 0;
  const bestScore = Number(stats?.best_score) || 0;
  const totalQuestions = Number(stats?.total_questions) || 0;

  // Average score is measured against the existing five-point scale.
  const progress = Math.min(
    Math.max((averageScore / 5) * 100, 0),
    100
  );

  // Reusable statistics card data.
  const statCards = [
    {
      icon: "◉",
      label: "Total Interviews",
      value: totalInterviews,
      suffix: "",
      accent: "violet",
    },
    {
      icon: "↗",
      label: "Average Score",
      value: averageScore.toFixed(2),
      suffix: " / 5",
      accent: "cyan",
    },
    {
      icon: "★",
      label: "Best Score",
      value: bestScore.toFixed(2),
      suffix: " / 5",
      accent: "amber",
    },
    {
      icon: "▤",
      label: "Questions Attempted",
      value: totalQuestions,
      suffix: "",
      accent: "green",
    },
  ];

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        {/* Dashboard heading and primary action */}
        <header className="dashboard-header">
          <div className="dashboard-heading">
            <div className="dashboard-eyebrow">
              <span className="dashboard-status-dot" />
              AI PERFORMANCE CENTER
            </div>

            <h1>
              Your Interview
              <span> Dashboard</span>
            </h1>

            <p>
              Track your progress, analyze your performance, and prepare
              for your next career opportunity.
            </p>
          </div>

          <button
            className="dashboard-primary-btn dashboard-header-btn"
            onClick={() => navigate("/interview-setup")}
          >
            <span>＋</span> Start Interview
          </button>
        </header>

        {/* Performance overview cards */}
        <section className="dashboard-stats-grid">
          {statCards.map((card) => (
            <article
              className={`dashboard-stat-card dashboard-${card.accent}`}
              key={card.label}
            >
              <div className="dashboard-stat-top">
                <span className="dashboard-stat-label">
                  {card.label}
                </span>
                <span className="dashboard-stat-icon">
                  {card.icon}
                </span>
              </div>

              <div className="dashboard-stat-value">
                {card.value}
                <span>{card.suffix}</span>
              </div>

              <div className="dashboard-stat-footer">
                <span className="dashboard-stat-indicator" />
                Your performance overview
              </div>
            </article>
          ))}
        </section>

        {/* Recent interview attempts */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-section-eyebrow">
                ACTIVITY
              </div>
              <h2>Recent Interviews</h2>
              <p>Your five latest interview attempts</p>
            </div>

            <button
              className="dashboard-secondary-btn"
              onClick={() => navigate("/profile")}
            >
              View All <span>→</span>
            </button>
          </div>

          {interviews.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">◉</div>
              <h3>Your journey starts here</h3>
              <p>
                You have no interview attempts yet. Start a mock interview
                to see your results and progress here.
              </p>
              <button
                className="dashboard-primary-btn"
                onClick={() => navigate("/interview-setup")}
              >
                Start Your First Interview →
              </button>
            </div>
          ) : (
            <div className="dashboard-interview-list">
              {interviews.map((interview) => {
                const score = Number(interview.score) || 0;
                const questionCount =
                  Number(interview.total_questions) || 0;

                return (
                  <article
                    className="dashboard-interview-item"
                    key={interview.id}
                  >
                    <div className="dashboard-interview-symbol">
                      <span>AI</span>
                    </div>

                    <div className="dashboard-interview-info">
                      <div className="dashboard-interview-title-row">
                        <h3>{interview.role || "Mock Interview"}</h3>
                        <span className="dashboard-attempt-badge">
                          Attempt {interview.attempt_number || 1}
                        </span>
                      </div>

                      <div className="dashboard-interview-meta">
                        <span>
                          <span className="dashboard-meta-label">
                            SCORE
                          </span>
                          <strong>
                            {score} / {questionCount}
                          </strong>
                        </span>

                        <span>
                          {interview.created_at
                            ? new Date(
                                interview.created_at
                              ).toLocaleString()
                            : "Date unavailable"}
                        </span>
                      </div>
                    </div>

                    <button
                      className="dashboard-details-btn"
                      onClick={() =>
                        navigate(
                          `/interview-details/${interview.id}`
                        )
                      }
                    >
                      Details <span>↗</span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Progress panel */}
        <section className="dashboard-progress-panel">
          <div className="dashboard-progress-content">
            <div className="dashboard-section-eyebrow">
              YOUR JOURNEY
            </div>
            <h2>Progress Overview</h2>
            <p>
              You have completed{" "}
              <strong>{totalInterviews}</strong>{" "}
              {totalInterviews === 1
                ? "mock interview"
                : "mock interviews"}.
              Keep practicing to strengthen your interview skills.
            </p>

            <div className="dashboard-progress-track">
              <div className="dashboard-progress-labels">
                <span>Average score progress</span>
                <strong>{Math.round(progress)}%</strong>
              </div>

              <div
                className="dashboard-progress-bar"
                role="progressbar"
                aria-label="Average score progress"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="dashboard-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="dashboard-progress-scale">
                <span>0</span>
                <span>Target score: 5 / 5</span>
              </div>
            </div>
          </div>

          <div
            className="dashboard-progress-ring"
            style={{ "--dashboard-progress": `${progress}%` }}
          >
            <div className="dashboard-progress-ring-inner">
              <strong>{Math.round(progress)}%</strong>
              <span>AVERAGE</span>
            </div>
          </div>
        </section>

        {/* Quick navigation */}
        <section className="dashboard-quick-actions">
          <button
            className="dashboard-quick-action"
            onClick={() => navigate("/interview-setup")}
          >
            <span className="dashboard-quick-icon">＋</span>
            <span>
              <strong>Practice Again</strong>
              <small>Start a new mock interview</small>
            </span>
            <span className="dashboard-quick-arrow">→</span>
          </button>

          <button
            className="dashboard-quick-action"
            onClick={() => navigate("/profile")}
          >
            <span className="dashboard-quick-icon">◎</span>
            <span>
              <strong>My Profile</strong>
              <small>Explore your interview history</small>
            </span>
            <span className="dashboard-quick-arrow">→</span>
          </button>

          <button
            className="dashboard-quick-action"
            onClick={() => navigate("/")}
          >
            <span className="dashboard-quick-icon">⌂</span>
            <span>
              <strong>Home</strong>
              <small>Return to the home page</small>
            </span>
            <span className="dashboard-quick-arrow">→</span>
          </button>
        </section>

        <footer className="dashboard-footer">
          <span className="dashboard-footer-dot" />
          AI MOCK INTERVIEW SYSTEM
          <span>·</span>
          YOUR NEXT OPPORTUNITY STARTS WITH PRACTICE
        </footer>
      </div>
    </main>
  );
}

export default Dashboard;
