import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  const { role, experience, type, questions } = location.state || {};

  const [answer, setAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);

  const score = answers.filter((ans) => ans.trim() !== "").length;

  let performanceMessage = "";

  if (score >= 4) {
    performanceMessage = "Great job! You performed well.";
  } else if (score >= 2) {
    performanceMessage = "Good effort! Keep practicing.";
  } else {
    performanceMessage = "Keep practicing and improve your answers.";
  }

  return (
    <div>
      {completed ? (
        <div>
          <h1>Interview Completed</h1>

          <p>Thank you for completing the interview.</p>

          <h2>
            Your Score: {score} / {questions?.length}
          </h2>

          <p>{performanceMessage}</p>

          <h2>Your Answers</h2>

          {answers.map((ans, index) => (
            <p key={index}>
              <strong>Question {index + 1}:</strong> {ans}
            </p>
          ))}
        </div>
      ) : (
        <div>
          <h1>AI Interview</h1>

          <p style={{ color: "#666", marginBottom: "20px" }}>
            Answer each question carefully before submitting.
          </p>

          <p>Role: {role}</p>
          <p>Experience: {experience}</p>
          <p>Type: {type}</p>

          <h2
            style={{
              color: "#222",
              backgroundColor: "#ffffff",
              padding: "10px 15px",
              borderRadius: "8px"
            }}
          >
            Question {questionNumber} of {questions?.length}
          </h2>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "10px",
              backgroundColor: "#ddd",
              borderRadius: "5px",
              margin: "15px 0 20px"
            }}
          >
            <div
              style={{
                width: `${(questionNumber / questions.length) * 100}%`,
                height: "100%",
                backgroundColor: "#4f46e5",
                borderRadius: "5px"
              }}
            ></div>
          </div>

          {/* Current Question */}
          <p
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#222",
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "10px",
              marginBottom: "20px"
            }}
          >
            {questions?.[questionNumber - 1]}
          </p>

          {/* Answer Box */}
          <textarea
            placeholder="Type your answer here..."
            rows="6"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "15px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              resize: "vertical",
              boxSizing: "border-box"
            }}
          />

          <br />
          <br />

          {/* Submit Button */}
          <button
            style={{
              marginTop: "15px",
              padding: "12px 25px",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
            onClick={() => {
              if (answer.trim() === "") {
                alert("Please enter your answer before submitting.");
                return;
              }

              const updatedAnswers = [...answers, answer];

              setAnswers(updatedAnswers);
              setAnswer("");

              if (questionNumber < questions.length) {
                setQuestionNumber(questionNumber + 1);
              } else {
                setCompleted(true);

                navigate("/result", {
                  state: {
                    score: updatedAnswers.filter(
                      (ans) => ans.trim() !== ""
                    ).length,
                    answers: updatedAnswers,
                    questions: questions
                  }
                });
              }
            }}
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}

export default Interview;