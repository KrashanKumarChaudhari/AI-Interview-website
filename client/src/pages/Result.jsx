import { useLocation } from "react-router-dom";
function Result() {
    const location = useLocation();

    const {score, answers, questions } = location.state || {};

    return (
        <div>
            <h1>Interview Result</h1>
            <h2>
              Your Score: {score} / {questions?.length}  
            </h2>
            <h2>Your Answers</h2>

            {answers?.map((answer, index) => (
                <p key={index}>
                    <strong>Question {index +1}:</strong> {answer}
                </p>
            ))} 

        </div>
    );
}

export default Result;