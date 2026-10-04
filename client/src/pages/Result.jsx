import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================
  // LOGIN CHECK
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const userId = user?.id;

  // Logged-out user ko Login page par bhejna
  useEffect(() => {
    if (!userId) {
      navigate("/login", {
        replace: true
      });
    }
  }, [userId, navigate]);

  // Logged-in user nahi hai to page render nahi karna
  if (!userId) {
    return null;
  }

  // ==========================================
  // RESULT DATA
  // Interview.jsx se received data
  // ==========================================

  const {
    score,
    answers,
    questions,

    // Gemini AI evaluation data
    evaluations,
    totalAIScore,
    maxAIScore
  } = location.state || {};

  // ==========================================
  // BASIC INFORMATION
  // ==========================================

  const totalQuestions =
    questions?.length || 0;

  const answeredQuestions =
    answers?.filter(
      (answer) =>
        answer.trim() !== ""
    ).length || 0;

  // ==========================================
  // AI SCORE
  // ==========================================
  //
  // Example:
  // 10 questions
  // AI total = 72 / 100
  //
  // Percentage = 72%
  // ==========================================

  const hasAIScore =
    typeof totalAIScore ===
      "number" &&
    typeof maxAIScore ===
      "number" &&
    maxAIScore > 0;

  const percentage = hasAIScore
    ? Math.round(
        (totalAIScore /
          maxAIScore) *
          100
      )
    : totalQuestions
    ? Math.round(
        (score /
          totalQuestions) *
          100
      )
    : 0;

  // ==========================================
  // PERFORMANCE LEVEL
  // ==========================================

  let performanceLevel = "";

  if (percentage >= 80) {
    performanceLevel = "Excellent";
  } else if (percentage >= 60) {
    performanceLevel = "Good";
  } else if (percentage >= 40) {
    performanceLevel = "Average";
  } else {
    performanceLevel =
      "Needs Improvement";
  }

  // ==========================================
  // GENERAL FEEDBACK
  // ==========================================

  let feedback = "";

  if (percentage >= 80) {
    feedback =
      "Excellent performance! Your answers show strong understanding.";
  } else if (percentage >= 60) {
    feedback =
      "Good performance! Keep practicing to improve further.";
  } else if (percentage >= 40) {
    feedback =
      "Average performance. Focus on improving the accuracy and completeness of your answers.";
  } else {
    feedback =
      "Keep practicing and work on improving your interview answers.";
  }

  // ==========================================
  // SAFE AI SCORE FORMATTER
  // ==========================================

  const getAIScore =
    (index) => {
      if (
        !evaluations ||
        !evaluations[index]
      ) {
        return null;
      }

      return evaluations[index]
        .score;
    };

  // ==========================================
  // SAFE AI FEEDBACK FORMATTER
  // ==========================================

  const getAIFeedback =
    (index) => {
      if (
        !evaluations ||
        !evaluations[index]
      ) {
        return null;
      }

      return evaluations[index]
        .feedback;
    };

  // ==========================================
  // RESULT UI
  // ==========================================

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "30px",
        fontFamily: "Arial",
        color: "#222",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        boxSizing: "border-box"
      }}
    >
      {/* ==========================================
          PAGE HEADING
          ========================================== */}

      <h1
        style={{
          textAlign: "center"
        }}
      >
        Interview Result
      </h1>

      {/* ==========================================
          OVERALL RESULT CARD
          ========================================== */}

      <div
        style={{
          textAlign: "center",
          padding: "25px",
          backgroundColor:
            "#f5f5f5",
          borderRadius: "12px",
          marginTop: "25px"
        }}
      >
        {/* AI SCORE */}
        {hasAIScore ? (
          <>
            <h2>
              AI Score:{" "}
              {totalAIScore} /{" "}
              {maxAIScore}
            </h2>

            <h3>
              Percentage:{" "}
              {percentage}%
            </h3>
          </>
        ) : (
          <>
            <h2>
              Your Score:{" "}
              {score} /{" "}
              {totalQuestions}
            </h2>

            <h3>
              Percentage:{" "}
              {percentage}%
            </h3>
          </>
        )}

        {/* ==========================================
            PROGRESS BAR
            ========================================== */}

        <div
          style={{
            width: "100%",
            height: "12px",
            backgroundColor:
              "#ddd",
            borderRadius: "6px",
            marginTop: "10px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              backgroundColor:
                "#4f46e5",
              borderRadius: "6px"
            }}
          ></div>
        </div>

        {/* PERFORMANCE */}
        <h3>
          Performance:{" "}
          {performanceLevel}
        </h3>

        {/* TOTAL QUESTIONS */}
        <p>
          Total Questions:{" "}
          {totalQuestions}
        </p>

        {/* ANSWERED QUESTIONS */}
        <p>
          Answered Questions:{" "}
          {answeredQuestions}
        </p>

        {/* GENERAL FEEDBACK */}
        <p
          style={{
            fontSize: "18px",
            fontWeight: "600"
          }}
        >
          {feedback}
        </p>
      </div>

      {/* ==========================================
          AI EVALUATION INFORMATION
          ========================================== */}

      {hasAIScore && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            backgroundColor:
              "#eef2ff",
            borderRadius: "12px",
            border:
              "1px solid #c7d2fe"
          }}
        >
          <h2
            style={{
              marginTop: 0
            }}
          >
            🤖 AI Evaluation
          </h2>

          <p
            style={{
              marginBottom: 0,
              lineHeight: "1.6"
            }}
          >
            Gemini AI evaluated your
            answers based on
            correctness, relevance,
            completeness, technical
            understanding and clarity.
          </p>
        </div>
      )}

      {/* ==========================================
          ANSWERS SECTION
          ========================================== */}

      <h2
        style={{
          marginTop: "30px"
        }}
      >
        Your Answers
      </h2>

      {answers?.map(
        (answer, index) => {
          const aiScore =
            getAIScore(index);

          const aiFeedback =
            getAIFeedback(index);

          const isSkipped =
            answer.trim() === "";

          return (
            <div
              key={index}
              style={{
                padding: "20px",
                marginBottom:
                  "20px",
                backgroundColor:
                  "#f5f5f5",
                borderRadius:
                  "10px",
                border:
                  "1px solid #ddd"
              }}
            >
              {/* QUESTION NUMBER */}
              <p
                style={{
                  fontWeight: "700",
                  fontSize: "18px",
                  marginBottom:
                    "10px"
                }}
              >
                Question{" "}
                {index + 1}
              </p>

              {/* QUESTION */}
              <p
                style={{
                  fontWeight: "600",
                  marginBottom:
                    "12px",
                  lineHeight:
                    "1.5"
                }}
              >
                {
                  questions?.[
                    index
                  ]
                }
              </p>

              {/* USER ANSWER */}
              <p
                style={{
                  color: "#555",
                  lineHeight:
                    "1.6",
                  marginBottom:
                    "15px"
                }}
              >
                <strong>
                  Your Answer:
                </strong>{" "}
                {isSkipped
                  ? "Not answered (Skipped)"
                  : answer}
              </p>

              {/* ==========================================
                  AI SCORE
                  ========================================== */}

              {aiScore !== null && (
                <div
                  style={{
                    marginTop:
                      "15px",
                    padding: "15px",
                    backgroundColor:
                      aiScore >= 7
                        ? "#dcfce7"
                        : aiScore >= 4
                        ? "#fef9c3"
                        : "#fee2e2",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #ddd"
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 8px",
                      fontWeight:
                        "700"
                    }}
                  >
                    🤖 AI Score:{" "}
                    {aiScore} / 10
                  </p>

                  {/* AI FEEDBACK */}
                  <p
                    style={{
                      margin: 0,
                      lineHeight:
                        "1.6"
                    }}
                  >
                    <strong>
                      AI Feedback:
                    </strong>{" "}
                    {aiFeedback ||
                      "No feedback available."}
                  </p>
                </div>
              )}
            </div>
          );
        }
      )}

      {/* ==========================================
          NAVIGATION BUTTONS
          ========================================== */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          justifyContent:
            "center",
          marginTop: "30px"
        }}
      >
        {/* BACK TO HOME */}
        <button
          onClick={() =>
            navigate("/")
          }
          style={{
            padding:
              "12px 20px",
            backgroundColor:
              "#4f46e5",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600"
          }}
        >
          Back to Home
        </button>

        {/* RESTART INTERVIEW */}
        <button
          onClick={() =>
            navigate(
              "/interview-setup"
            )
          }
          style={{
            padding:
              "12px 20px",
            backgroundColor:
              "#222",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600"
          }}
        >
          Restart Interview
        </button>
      </div>
    </div>
  );
}

export default Result;