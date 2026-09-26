import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get interview setup data from InterviewSetup page
  const { role, experience, type, questions } = location.state || {};

  // Get logged-in user information from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Store the current answer typed by the user
  const [answer, setAnswer] = useState("");

  // Track the current question number
  const [questionNumber, setQuestionNumber] = useState(1);

  // Store all answers given during the interview
  const [answers, setAnswers] = useState([]);

  // Track whether the interview is currently being saved
  const [saving, setSaving] = useState(false);

  // If interview setup data is missing, show an error
  if (!questions || questions.length === 0) {
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
          padding: "20px"
        }}
      >
        <h2>Interview data not found.</h2>

        <button
          onClick={() => navigate("/interview-setup")}
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
          Back to Interview Setup
        </button>
      </div>
    );
  }

  // Calculate the current score from submitted non-empty answers
  const score = answers.filter(
    (ans) => ans.trim() !== ""
  ).length;

  // Handle submitting the current answer
  const handleSubmitAnswer = async () => {
    // Prevent submitting an empty answer
    if (answer.trim() === "") {
      alert("Please enter your answer before submitting.");
      return;
    }

    // Make sure a logged-in user exists
    if (!userId) {
      alert("Please login before starting an interview.");
      navigate("/login");
      return;
    }

    // Add the current answer to the answers array
    const updatedAnswers = [...answers, answer.trim()];

    // Update answers state
    setAnswers(updatedAnswers);

    // Clear the textarea
    setAnswer("");

    // If more questions are remaining, move to the next question
    if (questionNumber < questions.length) {
      setQuestionNumber(questionNumber + 1);
      return;
    }

    // Final question has been submitted
    setSaving(true);

    // Calculate final score
    const finalScore = updatedAnswers.filter(
      (ans) => ans.trim() !== ""
    ).length;

    try {
      // Send the complete interview attempt to the backend
      const response = await fetch(
        "http://localhost:5000/api/interviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            // Logged-in user's ID
            user_id: userId,

            // Interview configuration
            role: role,
            experience: experience,
            interview_type: type,

            // Final score
            score: finalScore,

            // Total number of questions
            total_questions: questions.length,

            // Save all questions
            questions: questions,

            // Save all user answers
            answers: updatedAnswers
          })
        }
      );

      // Convert backend response to JSON
      const data = await response.json();

      // Check whether the interview was actually saved
      if (!response.ok) {
        console.error("Backend save error:", data);

        alert(
          data.message || "Failed to save interview result."
        );

        setSaving(false);
        return;
      }

      // Confirm successful save in browser console
      console.log(
        "Interview saved successfully:",
        data.interview
      );

      // Go to Result page only after successful database save
      navigate("/result", {
        state: {
          score: finalScore,
          answers: updatedAnswers,
          questions: questions
        }
      });
    } catch (error) {
      // Handle server connection or network errors
      console.error(
        "Error saving interview result:",
        error
      );

      alert(
        "Unable to save interview. Please make sure the backend server is running."
      );

      setSaving(false);
    }
  };

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
        {/* Interview heading */}
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "32px"
          }}
        >
          AI Mock Interview
        </h1>

        <p
          style={{
            color: "#a5b4fc",
            marginBottom: "30px"
          }}
        >
          Answer the questions to complete your interview.
        </p>

        {/* Interview configuration information */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
            border: "1px solid #334155"
          }}
        >
          <p style={{ margin: "0 0 10px" }}>
            <strong>Role:</strong> {role}
          </p>

          <p style={{ margin: "0 0 10px" }}>
            <strong>Experience:</strong> {experience}
          </p>

          <p style={{ margin: "0 0 10px" }}>
            <strong>Interview Type:</strong> {type}
          </p>

          <p style={{ margin: 0 }}>
            <strong>Total Questions:</strong>{" "}
            {questions.length}
          </p>
        </div>

        {/* Interview progress */}
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              margin: "0 0 8px",
              color: "#cbd5e1"
            }}
          >
            Question {questionNumber} of {questions.length}
          </p>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#334155",
              borderRadius: "10px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${
                  (questionNumber / questions.length) * 100
                }%`,
                height: "100%",
                backgroundColor: "#6366f1",
                borderRadius: "10px"
              }}
            ></div>
          </div>
        </div>

        {/* Current interview question */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "20px",
            border: "1px solid #334155"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              lineHeight: "1.5"
            }}
          >
            {questions[questionNumber - 1]}
          </h2>
        </div>

        {/* Answer input */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows="8"
          disabled={saving}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "15px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            border: "1px solid #475569",
            borderRadius: "10px",
            resize: "vertical",
            fontSize: "16px",
            outline: "none",
            marginBottom: "20px",
            opacity: saving ? 0.6 : 1
          }}
        />

        {/* Submit answer button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <button
            onClick={handleSubmitAnswer}
            disabled={saving}
            style={{
              padding: "12px 24px",
              backgroundColor: saving
                ? "#64748b"
                : "#4f46e5",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: saving
                ? "not-allowed"
                : "pointer",
              fontSize: "15px",
              fontWeight: "600"
            }}
          >
            {saving
              ? "Saving Interview..."
              : questionNumber === questions.length
              ? "Finish Interview"
              : "Submit Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Interview;