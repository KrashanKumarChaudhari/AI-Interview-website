import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  // Used to navigate between pages
  const navigate = useNavigate();

  // Store dashboard statistics
  const [stats, setStats] = useState(null);

  // Store recent interview history
  const [interviews, setInterviews] = useState([]);

  // Track loading state
  const [loading, setLoading] = useState(true);

  // Store error message
  const [error, setError] = useState("");

  useEffect(() => {
    // Get logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // If user is not logged in, go to Login page
    if (!user?.id) {
      navigate("/login");
      return;
    }

    // Load dashboard data
    const loadDashboard = async () => {
      try {
        // Fetch overall interview statistics
        const statsResponse = await fetch(
          `http://localhost:5000/api/interviews/stats/${user.id}`
        );

        const statsData = await statsResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message || "Failed to load statistics."
          );
        }

        // Save statistics
        setStats(statsData);

        // Fetch user's interview history
        const interviewResponse = await fetch(
          `http://localhost:5000/api/interviews/${user.id}`
        );

        const interviewData = await interviewResponse.json();

        if (!interviewResponse.ok) {
          throw new Error(
            interviewData.message ||
              "Failed to load interview history."
          );
        }

        // Keep only the latest 5 interviews
        setInterviews(interviewData.slice(0, 5));
      } catch (error) {
        // Display error in browser console
        console.error("Dashboard error:", error);

        // Show error message
        setError(
          error.message || "Failed to load dashboard."
        );
      } finally {
        // Stop loading
        setLoading(false);
      }
    };

    // Start loading dashboard data
    loadDashboard();
  }, [navigate]);

  // ------------------------------------------
  // Loading Screen
  // ------------------------------------------

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "20px"
        }}
      >
        Loading Dashboard...
      </div>
    );
  }

  // ------------------------------------------
  // Error Screen
  // ------------------------------------------

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "20px",
          padding: "20px",
          textAlign: "center"
        }}
      >
        <h2>{error}</h2>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 22px",
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        padding: "50px 20px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          margin: "0 auto"
        }}
      >

        {/* ======================================
            DASHBOARD HEADER
        ====================================== */}

        <div
          style={{
            marginBottom: "35px"
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#818cf8",
              fontSize: "14px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
          >
            AI Interview Dashboard
          </p>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "38px",
              fontWeight: "800",
              color: "#ffffff"
            }}
          >
            Interview Performance
          </h1>

          <p
            style={{
              margin: 0,
              color: "#cbd5e1",
              fontSize: "16px",
              lineHeight: "1.6"
            }}
          >
            Track your overall mock interview performance
            and review your recent attempts.
          </p>
        </div>


        {/* ======================================
            STATISTICS CARDS
        ====================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "30px"
          }}
        >

          {/* Total Interviews */}
          <div
            style={{
              backgroundColor: "#172554",
              padding: "24px",
              borderRadius: "15px",
              border: "1px solid #3730a3",
              boxShadow: "0 8px 25px rgba(0,0,0,0.20)"
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "12px"
              }}
            >
              🎤
            </div>

            <p
              style={{
                margin: "0 0 8px",
                color: "#a5b4fc",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              Total Interviews
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#ffffff"
              }}
            >
              {stats.total_interviews}
            </h2>
          </div>


          {/* Average Score */}
          <div
            style={{
              backgroundColor: "#172554",
              padding: "24px",
              borderRadius: "15px",
              border: "1px solid #3730a3",
              boxShadow: "0 8px 25px rgba(0,0,0,0.20)"
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "12px"
              }}
            >
              📊
            </div>

            <p
              style={{
                margin: "0 0 8px",
                color: "#a5b4fc",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              Average Score
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#ffffff"
              }}
            >
              {stats.average_score} / 5
            </h2>
          </div>


          {/* Best Score */}
          <div
            style={{
              backgroundColor: "#172554",
              padding: "24px",
              borderRadius: "15px",
              border: "1px solid #3730a3",
              boxShadow: "0 8px 25px rgba(0,0,0,0.20)"
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "12px"
              }}
            >
              🏆
            </div>

            <p
              style={{
                margin: "0 0 8px",
                color: "#a5b4fc",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              Best Score
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#ffffff"
              }}
            >
              {stats.best_score} / 5
            </h2>
          </div>


          {/* Questions Attempted */}
          <div
            style={{
              backgroundColor: "#172554",
              padding: "24px",
              borderRadius: "15px",
              border: "1px solid #3730a3",
              boxShadow: "0 8px 25px rgba(0,0,0,0.20)"
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "12px"
              }}
            >
              📝
            </div>

            <p
              style={{
                margin: "0 0 8px",
                color: "#a5b4fc",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              Questions Attempted
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#ffffff"
              }}
            >
              {stats.total_questions}
            </h2>
          </div>

        </div>


        {/* ======================================
            RECENT INTERVIEWS
        ====================================== */}

        <div
          style={{
            backgroundColor: "#172554",
            padding: "28px",
            borderRadius: "16px",
            border: "1px solid #3730a3",
            marginBottom: "25px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.20)"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "22px"
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "24px",
                  color: "#ffffff"
                }}
              >
                Recent Interviews
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "14px"
                }}
              >
                Your latest interview attempts
              </p>
            </div>

            {/* Open complete profile history */}
            <button
              onClick={() => navigate("/profile")}
              style={{
                padding: "9px 16px",
                backgroundColor: "#334155",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600"
              }}
            >
              View All
            </button>
          </div>


          {/* Show message if there are no interviews */}
          {interviews.length === 0 ? (
            <div
              style={{
                padding: "25px",
                backgroundColor: "#0f172a",
                borderRadius: "12px",
                border: "1px solid #334155",
                textAlign: "center"
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#cbd5e1"
                }}
              >
                No interview history found.
              </p>
            </div>
          ) : (

            interviews.map((interview) => (
              <div
                key={interview.id}
                style={{
                  backgroundColor: "#0f172a",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  marginBottom: "12px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap"
                  }}
                >

                  {/* Interview information */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: "240px"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: "8px"
                      }}
                    >

                      {/* Role */}
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          color: "#ffffff"
                        }}
                      >
                        {interview.role}
                      </h3>

                      {/* Attempt badge */}
                      <span
                        style={{
                          backgroundColor: "#312e81",
                          color: "#c7d2fe",
                          padding: "4px 9px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}
                      >
                        Attempt {interview.attempt_number || 1}
                      </span>

                    </div>


                    {/* Interview details row */}
                    <div
                      style={{
                        display: "flex",
                        gap: "18px",
                        flexWrap: "wrap"
                      }}
                    >

                      <span
                        style={{
                          color: "#cbd5e1",
                          fontSize: "14px"
                        }}
                      >
                        Score:{" "}
                        <strong style={{ color: "#ffffff" }}>
                          {interview.score} /{" "}
                          {interview.total_questions}
                        </strong>
                      </span>

                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "14px"
                        }}
                      >
                        {new Date(
                          interview.created_at
                        ).toLocaleString()}
                      </span>

                    </div>

                  </div>


                  {/* View Details button */}
                  <button
                    onClick={() =>
                      navigate(
                        `/interview-details/${interview.id}`
                      )
                    }
                    style={{
                      padding: "10px 18px",
                      backgroundColor: "#4f46e5",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    View Details →
                  </button>

                </div>

              </div>
            ))

          )}

        </div>


        {/* ======================================
            PROGRESS INFORMATION
        ====================================== */}

        <div
          style={{
            backgroundColor: "#172554",
            padding: "28px",
            borderRadius: "16px",
            border: "1px solid #3730a3",
            marginBottom: "25px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.20)"
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px"
            }}
          >

            <span
              style={{
                fontSize: "24px"
              }}
            >
              📈
            </span>

            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                color: "#ffffff"
              }}
            >
              Your Progress
            </h2>

          </div>

          <p
            style={{
              margin: 0,
              color: "#cbd5e1",
              lineHeight: "1.7",
              fontSize: "15px"
            }}
          >
            You have completed{" "}
            <strong style={{ color: "#ffffff" }}>
              {stats.total_interviews}
            </strong>{" "}
            mock interview
            {stats.total_interviews !== 1 ? "s" : ""}.
            Keep practicing to improve your interview
            performance.
          </p>

          {/* Average score progress bar */}
<div
  style={{
    marginTop: "22px"
  }}
>
  {/* Progress bar heading */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
      color: "#cbd5e1",
      fontSize: "14px",
      fontWeight: "600"
    }}
  >
    <span>Average Score Progress</span>

    <span>
      {Math.round(
        (stats.average_score / 5) * 100
      )}
      %
    </span>
  </div>

  {/* Progress bar background */}
  <div
    style={{
      width: "100%",
      height: "10px",
      backgroundColor: "#0f172a",
      borderRadius: "10px",
      overflow: "hidden",
      border: "1px solid #334155"
    }}
  >
    {/* Actual progress */}
    <div
      style={{
        width: `${Math.min(
          (stats.average_score / 5) * 100,
          100
        )}%`,
        height: "100%",
        backgroundColor: "#4f46e5",
        borderRadius: "10px",
        transition: "width 0.5s ease"
      }}
    />
  </div>
</div>

        </div>


        {/* ======================================
            NAVIGATION BUTTONS
        ====================================== */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >

          {/* Start another interview */}
          <button
            onClick={() => navigate("/interview-setup")}
            style={{
              padding: "12px 22px",
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600"
            }}
          >
            Start Interview →
          </button>


          {/* Go to profile */}
          <button
            onClick={() => navigate("/profile")}
            style={{
              padding: "12px 22px",
              backgroundColor: "#334155",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600"
            }}
          >
            My Profile
          </button>


          {/* Go back home */}
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 22px",
              backgroundColor: "#334155",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600"
            }}
          >
            Home
          </button>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;