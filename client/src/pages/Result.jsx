import { useLocation, useNavigate } from "react-router-dom";
function Result() {
    const location = useLocation();
    const navigate = useNavigate();

    const {score, answers, questions } = location.state || {};
    const percentage = questions?.length
        ? Math.round((score / questions.length) * 100)
        : 0;

        let performanceLevel = "";

        if (percentage >= 80) {
            performanceLevel = "Excellent";
        } else if (percentage >= 60) {
            performanceLevel = "Good";
        } else if (percentage >= 40) {
            performanceLevel = "Average";
        } else {
            performanceLevel = "Needs Improvment";
        }    

    let feedback = "";

    if (score >= 4) {
        feedback = "Great job! You performed well.";
    } else if (score >= 2) {
        feedback = "Good effort! Keep practicing.";
    } else {
        feedback = "Keep practicing to improve your interview skills.";
    }


    return (
        <div style={{padding: "40px", maxWidth: "800px", margin: "auto"}}>
            <h1>Interview Result</h1>
            <h2>
              <h2 style={{ fontSize: "28px"}}>
                Your score: {score} / {questions?.length}
              </h2>
              <h3>Percentage: {percentage}%</h3>
              <h3>Performance: {performanceLevel}</h3>
              <p>Total Questions: {questions?.length}</p>

              <p>Answered Questions: {" "}
                {answers?.filter((answer) => answer.trim() !== "").length}
              </p>
                
             

              <p style={{fontSize: "18px"}}>{feedback}</p>
            </h2>
            <h2>Your Answers</h2>

            {answers?.map((answer, index) => (
                <p key={index}>
                    <strong>Question {index +1}:</strong> {answer}
                </p>
            ))} 
            <button onClick={() => navigate("/")}>
                Back to Home
            </button>
            <button onClick={() => navigate("/interview-setup")}>
                Restart Interview
            </button>

        </div>
    );
}

export default Result;