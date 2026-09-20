import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const { score, answers, questions } = location.state || {};

  const totalQuestions = questions?.length || 0;

  const percentage = totalQuestions
    ? Math.round((score / totalQuestions) * 100)
    : 0;

  let performanceLevel = "";

  if (percentage >= 80) {
    performanceLevel = "Excellent";
  } else if (percentage >= 60) {
    performanceLevel = "Good";
  } else if (percentage >= 40) {
    performanceLevel = "Average";
  } else {
    performanceLevel = "Needs Improvement";
  }

  let feedback = "";

  if (score >= 4) {
    feedback = "Great job! You performed well.";
  } else if (score >= 2) {
    feedback = "Good effort! Keep practicing.";
  } else {
    feedback = "Keep practicing to improve your interview skills.";
  }

  const answeredQuestions =
    answers?.filter((answer) => answer.trim() !== "").length || 0;

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
      <h1 style={{ textAlign: "center" }}>
        Interview Result
      </h1>

      <div
        style={{
          textAlign: "center",
          padding: "25px",
          backgroundColor: "#f5f5f5",
          borderRadius: "12px",
          marginTop: "25px"
        }}
      >
        <h2>
          Your Score: {score} / {totalQuestions}
        </h2>

        <h3>Percentage: {percentage}%</h3>
        <div
          style={{
            width: "100%",
            height: "12px",
            backgroundColor: "#ddd",
            borderRadius: "6px",
            marginTop: "10px",
            overflow: "hidden"
          }}
        >
          <div 
            style={{
              width: `${percentage}%`,
              height: "100%",
              backgroundColor: "#4f46e5",
              borderRadius: "6px"
            }}
            ></div>
          
          </div>  

        <h3>Performance: {performanceLevel}</h3>

        <p>Total Questions: {totalQuestions}</p>

        <p>Answered Questions: {answeredQuestions}</p>

        <p
          style={{
            fontSize: "18px",
            fontWeight: "600"
          }}
        >
          {feedback}
        </p>
      </div>

      <h2 style={{ marginTop: "30px" }}>
        Your Answers
      </h2>

 {answers?.map((answer, index) => (
  <div
    key={index}
    style={{
      padding: "20px",
      marginBottom: "20px",
      backgroundColor: "#f5f5f5",
      borderRadius: "10px",
      border: "1px solid #ddd"
    }}
  >
    <p
      style={{
        fontWeight: "700",
        fontSize: "18px",
        marginBottom: "10px"
      }}
    >
      Question {index + 1}
    </p>

    <p
      style={{
        fontWeight: "600",
        marginBottom: "5px"
      }}
    >
      {questions?.[index]}
    </p>

    <p
      style={{
        color: "#555",
        lineHeight: "1.6"
      }}
    >
      <strong>Your Answer:</strong> {answer}
    </p>
  </div>
))}

      <div
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          marginTop: "30px"
        }}
      >
        <button
          onClick={() => navigate("/")}
       style={{
  padding: "12px 20px",
  backgroundColor: "#4f46e5",
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

        <button
          onClick={() => navigate("/interview-setup")}
         style={{
  padding: "12px 20px",
  backgroundColor: "#222",
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