import { useNavigate } from "react-router-dom";
import { useState } from "react";

function InterviewSetup() {
const navigate = useNavigate();    
const [role, setRole] = useState("");
const [experience, setExperience] = useState("");
const [type, setType] = useState("");
const [questions, setQuestions] = useState("");

  return (
    <div className="setup-page">
      <div className="setup-card">
        <h1>Interview Setup</h1>

        <p>Configure your AI interview</p>

        <label>Job Role</label>

        <input
          type="text"
          placeholder="e.g. Frontend Developer"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <label>Experience Level</label>

<select
  value={experience}
  onChange={(e) => setExperience(e.target.value)}
>
  <option value="">Select experience level</option>
  <option value="beginner">Beginner</option>
  <option value="intermediate">Intermediate</option>
  <option value="advanced">Advanced</option>
</select>

        <label>Interview Type</label>

<select
  value={type}
  onChange={(e) => setType(e.target.value)}
>
  <option value="">Select interview type</option>
  <option value="technical">Technical</option>
  <option value="hr">HR</option>
  <option value="mixed">Technical + HR</option>
</select>

        <label>Number of Questions</label>

<select
  value={questions}
  onChange={(e) => setQuestions(e.target.value)}
>
  <option value="">Select number of questions</option>
  <option value="5">5 Questions</option>
  <option value="10">10 Questions</option>
  <option value="15">15 Questions</option>
  <option value="20">20 Questions</option>
</select>

<button
  className="start-btn"
  onClick={() => {
    console.log({
      role,
      experience,
      type,
      questions,
    });
    navigate("/interview");
  }}
>
  Continue →
</button>

      </div>
    </div>
  );
}


export default InterviewSetup;