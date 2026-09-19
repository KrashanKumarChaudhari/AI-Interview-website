import { useState } from "react";

const questions = [
  "Tell me about yourself.",
  "What are your strengths?",
  "What are your weaknesses?",
  "Why should we hire you?",
  "Where do you see yourself in five years?"
];

function Interview() {
  const [answer, setAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);

  const score = answers.filter((ans) => ans.trim() !== "").length;
  let performanceMessage = "";

  if (score >= 4) {
    performanceMessage = "Great job! You performed well.";
  } else if (score >= 2) {
    performanceMessage = "Good effor! Keep practicing.";
  } else {
    performanceMessage = "Keep practicing and improve your answers.";
  }

  return (
    <div>
      {completed ? (
        <div>
          <h1>Interview Completed</h1>
          <p>Thank you for completing the interview.</p>
          <h2>Your Score: {score} / {questions.length}</h2>
          <p>{performanceMessage}</p>

          <h2>Your Answers</h2>

          {
            answers.map((ans, index) => (
              <p key={index}>
                    <strong>Question {index +1}:</strong> {ans}
              </p>  

            ))}
        </div>
      ) : (
        <div>
          <h1>AI Interview</h1>

          <h2>Question {questionNumber}</h2>

          <p>{questions[questionNumber - 1]}</p>

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
              console.log(answer);
              setAnswers([...answers, answer])
              setAnswer("");

              if (questionNumber < questions.length) {
                setQuestionNumber(questionNumber + 1);
              } else {
                setCompleted(true);
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