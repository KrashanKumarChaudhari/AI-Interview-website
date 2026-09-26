import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function InterviewDetails() {
  // Get the selected interview ID from the URL
  const { id } = useParams();

  // Used for navigating between pages
  const navigate = useNavigate();

  // Store selected interview details
  const [interview, setInterview] = useState(null);

  // Store loading state while data is being fetched
  const [loading, setLoading] = useState(true);

  // Store error message if API request fails
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch details of the selected interview attempt
    fetch(`http://localhost:5000/api/interviews/details/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Interview details not found");
        }

        return response.json();
      })
      .then((data) => {
        // Save interview data in state
        setInterview(data);

        // Stop loading after successful response
        setLoading(false);
      })
      .catch((error) => {
        // Handle API or server errors
        console.error("Interview details error:", error);

        setError("Failed to load interview details.");
        setLoading(false);
      });
  }, [id]);

  // Show loading message while API request is running
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
        Loading interview details...
      </div>
    );
  }

  // Show error message if interview was not found
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
          gap: "20px"
        }}
      >
        <h2>{error}</h2>

        <button
          onClick={() => navigate("/profile")}
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
          Back to Profile
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
        padding: "40px 20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#172554",
          padding: "40px",
          borderRadius: "18px",
          border: "1px solid #3730a3",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)"
        }}
      >
        {/* Page heading */}
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "32px"
          }}
        >
          Interview Details
        </h1>

        <p
          style={{
            color: "#a5b4fc",
            marginBottom: "30px"
          }}
        >
          Detailed information about this interview attempt
        </p>

        {/* Basic interview information */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "25px",
            borderRadius: "12px",
            border: "1px solid #334155",
            marginBottom: "30px"
          }}
        >
          <p style={{ margin: "0 0 18px" }}>
            <strong>Role:</strong> {interview.role}
          </p>

          <p style={{ margin: "0 0 18px" }}>
            <strong>Experience:</strong> {interview.experience}
          </p>

          <p style={{ margin: "0 0 18px" }}>
            <strong>Interview Type:</strong>{" "}
            {interview.interview_type}
          </p>

          <p
            style={{
              margin: "0 0 18px",
              color: "#a5b4fc"
            }}
          >
            <strong>Score:</strong>{" "}
            {interview.score} / {interview.total_questions}
          </p>

          <p
            style={{
              margin: 0,
              color: "#94a3b8"
            }}
          >
            <strong>Date:</strong>{" "}
            {new Date(interview.created_at).toLocaleString()}
          </p>
        </div>

        {/* Questions and answers section */}
        <h2
          style={{
            margin: "0 0 20px",
            fontSize: "24px"
          }}
        >
          Questions & Answers
        </h2>

        {/* Display every question with its corresponding answer */}
        {interview.questions &&
        interview.questions.length > 0 ? (
          interview.questions.map((question, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#0f172a",
                padding: "22px",
                borderRadius: "12px",
                marginBottom: "15px",
                border: "1px solid #334155"
              }}
            >
              {/* Question number and question text */}
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: "18px",
                  lineHeight: "1.5"
                }}
              >
                Q{index + 1}. {question}
              </h3>

              {/* User's answer for this question */}
              <p
                style={{
                  margin: 0,
                  color: "#cbd5e1",
                  lineHeight: "1.6"
                }}
              >
                <strong>Answer:</strong>{" "}
                {interview.answers &&
                interview.answers[index]
                  ? interview.answers[index]
                  : "No answer provided."}
              </p>
            </div>
          ))
        ) : (
          // Show this when old interview records have no questions
          <div
            style={{
              backgroundColor: "#0f172a",
              padding: "20px",
              borderRadius: "12px",
              color: "#cbd5e1"
            }}
          >
            No questions and answers available for this interview.
          </div>
        )}

        {/* Back to Profile button */}
        <button
          onClick={() => navigate("/profile")}
          style={{
            marginTop: "15px",
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
          Back to Profile
        </button>
      </div>
    </div>
  );
}

export default InterviewDetails;