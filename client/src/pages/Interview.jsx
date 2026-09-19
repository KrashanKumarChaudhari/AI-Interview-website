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

          <h2>Your Score: {score} / {questions?.length}</h2>

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

          <p>Role: {role}</p>
          <p>Experience: {experience}</p>
          <p>Type: {type}</p>

          <h2>Question {questionNumber} of {questions?.length}</h2>
          <div 
            style={{
              width: "100%",
              height: "10px",
              backgroundColor: "#ddd",
              borderRadius: "15px 0"
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

          <p>{questions?.[questionNumber - 1]}</p>

          <textarea
            placeholder="Type your answer here..."
            rows="6"
            cols="50"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <br />
          <br />

          <button
          
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