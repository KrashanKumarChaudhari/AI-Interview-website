import { useState } from "react";

function Interview() {

    const [answer, setAnswer] = useState("");
    
    return (
        <div>
            <h1>AI Interview</h1>

            <h2>Question 1</h2>

            <p>Tell me about yourself.</p>

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
        setAnswer("");
    }}
>

  Submit Answer
</button> 
        </div>
    );
}

export default Interview;