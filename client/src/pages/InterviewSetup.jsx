import { useNavigate } from "react-router-dom";
import { useState } from "react";


function InterviewSetup() {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [type, setType] = useState("");

  const navigate = useNavigate();

  const questions = [
    "Tell me about yourself.",
    "What are your technical skills?",
    "Describe a challenging project you worked on.",
    "How do you handle pressure and deadlines?",
    "Why should we hire you?"
  ];

  return (
    <div>
      <div className="setup-card">
        <h1>Interview Setup</h1>

        <label>Select Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select role</option>
          <option value="Software Developer">Software Developer</option>
          <option value="Web Developer">Web Developer</option>
          <option value="Java Developer">Java Developer</option>
          <option value="Python Developer">Python Developer</option>
        </select>

        <br />
        <br />

        <label>Select Experience</label>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        >
          <option value="">Select experience level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <br />
        <br />

        <label>Interview Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Select interview type</option>
          <option value="Technical">Technical</option>
          <option value="HR">HR</option>
          <option value="Mixed">Mixed</option>
        </select>

        <br />
        <br />

        <button
          className="start-btn"
          onClick={() => {
            console.log({
              role,
              experience,
              type,
              questions
            });

            navigate("/interview", {
              state: {
                role,
                experience,
                type,
                questions
              }
            });
          }}
        >
          Start Interview
        </button>
      </div>
    </div>
  );
}

export default InterviewSetup;