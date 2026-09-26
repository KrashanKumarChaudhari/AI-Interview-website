import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewSetup() {
  // Store the selected interview role
  const [role, setRole] = useState("");

  // Store the selected experience level
  const [experience, setExperience] = useState("");

  // Store the selected interview type
  const [type, setType] = useState("");

  // Used to navigate to the interview page
  const navigate = useNavigate();

  // Questions used for the current interview
  const questions = [
    "Tell me about yourself.",
    "What are your technical skills?",
    "Describe a challenging project you worked on.",
    "How do you handle pressure and deadlines?",
    "Why should we hire you?"
  ];

  // Start the interview after validating the setup
  const handleStartInterview = () => {
    // Make sure all interview options are selected
    if (!role || !experience || !type) {
      alert(
        "Please select Role, Experience and Interview Type."
      );
      return;
    }

    // Send the complete interview setup to the Interview page
    navigate("/interview", {
      state: {
        role: role,
        experience: experience,
        type: type,
        questions: questions
      }
    });
  };

  return (
    <div>
      <div className="setup-card">
        {/* Page heading */}
        <h1>Interview Setup</h1>

        {/* Role selection */}
        <label>Select Role</label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select role</option>
          <option value="Software Developer">
            Software Developer
          </option>
          <option value="Web Developer">
            Web Developer
          </option>
          <option value="Java Developer">
            Java Developer
          </option>
          <option value="Python Developer">
            Python Developer
          </option>
        </select>

        <br />
        <br />

        {/* Experience selection */}
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

        {/* Interview type selection */}
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

        {/* Start interview button */}
        <button
          className="start-btn"
          onClick={handleStartInterview}
        >
          Start Interview
        </button>
      </div>
    </div>
  );
}

export default InterviewSetup;