import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewSetup() {
  // Store the selected interview role
  const [role, setRole] = useState("");

  // Store the selected experience level
  const [experience, setExperience] = useState("");

  // Store the selected interview type
  const [type, setType] = useState("");

  // Selected resume file ko store karega
const [resume, setResume] = useState(null);

  // Used to navigate to the interview page
  const navigate = useNavigate();

  // Get the logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Redirect logged-out users to Login page
  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  // Don't render Interview Setup for logged-out users
  if (!userId) {
    return null;
  }

  // Questions used for the current interview
  const questions = [
    "Tell me about yourself.",
    "What are your technical skills?",
    "Describe a challenging project you worked on.",
    "How do you handle pressure and deadlines?",
    "Why should we hire you?"
  ];

  // Start the interview after validating the setup
 // ==========================================
// START INTERVIEW
// Resume ko backend par upload karega
// aur uske baad Interview page par jayega.
// ==========================================

const handleStartInterview = async () => {
  // Role, Experience aur Interview Type check karo
  if (!role || !experience || !type) {
    alert(
      "Please select Role, Experience and Interview Type."
    );
    return;
  }

  try {
    // Resume upload ke liye FormData create karna
    const formData = new FormData();

    // Agar user ne resume select kiya hai
    if (resume) {
      formData.append("resume", resume);
    }

    let uploadedResume = null;

    // Sirf tab upload API call hogi jab resume selected ho
    if (resume) {
      const response = await fetch(
        "http://localhost:5000/api/upload-resume",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      // Upload fail hone par error show karo
      if (!response.ok) {
        alert(data.message || "Resume upload failed.");
        return;
      }

      // Backend se received resume information
      uploadedResume = data;

      console.log(
        "Resume uploaded successfully:",
        data
      );
    }

    // Interview page par navigate karo
    navigate("/interview", {
      state: {
        role: role,
        experience: experience,
        type: type,
        questions: questions,

        // Backend se uploaded resume ki information
        resume: uploadedResume
      }
    });

  } catch (error) {
    console.error(
      "Resume upload error:",
      error
    );

    alert(
      "Unable to upload resume. Please try again."
    );
  }
};

// handleStartInterview function close


return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "50px 20px",
        boxSizing: "border-box"
      }}
    >
      {/* Main setup card */}
      <div
        className="setup-card"
        style={{
          width: "100%",
          maxWidth: "650px",
          backgroundColor: "#172554",
          border: "1px solid #3730a3",
          borderRadius: "22px",
          padding: "42px",
          boxSizing: "border-box",
          boxShadow:
            "0 25px 60px rgba(0, 0, 0, 0.35)"
        }}
      >
        {/* Top icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            backgroundColor: "#0f172a",
            border: "1px solid #3730a3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
            marginBottom: "20px"
          }}
        >
          🤖
        </div>

        {/* Page heading */}
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "34px",
            fontWeight: "700",
            letterSpacing: "-0.5px"
          }}
        >
          Interview Setup
        </h1>

        {/* Subtitle */}
        <p
          style={{
            margin: "0 0 35px",
            color: "#a5b4fc",
            fontSize: "16px",
            lineHeight: "1.6"
          }}
        >
          Customize your interview and get ready to
          showcase your skills.
        </p>

        {/* Progress / information strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "30px"
          }}
        >
          <span style={{ fontSize: "20px" }}>✨</span>

          <span
            style={{
              color: "#cbd5e1",
              fontSize: "14px"
            }}
          >
            Choose your preferences before starting
            the interview.
          </span>
        </div>

        {/* Resume Upload */}
<div style={{ marginBottom: "30px" }}>
  <label
    style={{
      display: "block",
      marginBottom: "9px",
      fontSize: "15px",
      fontWeight: "600",
      color: "#e2e8f0"
    }}
  >
    📄 Upload Resume
  </label>

  <input
    type="file"
    accept=".pdf,.doc,.docx"
   onChange={(e) => {
  const file = e.target.files[0];

  if (file) {
    // Selected resume ko state me store kar rahe hain
    setResume(file);

    console.log("Selected Resume:", file);
  }
}}
    style={{
      width: "100%",
      padding: "13px",
      backgroundColor: "#0f172a",
      color: "#cbd5e1",
      border: "1px solid #475569",
      borderRadius: "10px",
      fontSize: "14px",
      cursor: "pointer",
      boxSizing: "border-box"
    }}
  />

  {/* Selected resume ka naam show karega */}
{resume && (
  <div
    style={{
      marginTop: "12px",
      padding: "12px 14px",
      backgroundColor: "#0f172a",
      border: "1px solid #3730a3",
      borderRadius: "10px",
      color: "#cbd5e1",
      fontSize: "14px"
    }}
  >
    ✅ Selected:{" "}
    <span style={{ color: "#ffffff", fontWeight: "600" }}>
      {resume.name}
    </span>
  </div>
)}

  <p
    style={{
      margin: "8px 0 0",
      color: "#64748b",
      fontSize: "12px"
    }}
  >
    Supported formats: PDF, DOC, DOCX
  </p>
</div>

        {/* Role selection */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "9px",
              fontSize: "15px",
              fontWeight: "600",
              color: "#e2e8f0"
            }}
          >
            💼 Select Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              backgroundColor: "#0f172a",
              color: role ? "#ffffff" : "#94a3b8",
              border: "1px solid #475569",
              borderRadius: "10px",
              fontSize: "15px",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box"
            }}
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
        </div>

        {/* Experience selection */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "9px",
              fontSize: "15px",
              fontWeight: "600",
              color: "#e2e8f0"
            }}
          >
            📈 Select Experience
          </label>

          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              backgroundColor: "#0f172a",
              color: experience
                ? "#ffffff"
                : "#94a3b8",
              border: "1px solid #475569",
              borderRadius: "10px",
              fontSize: "15px",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box"
            }}
          >
            <option value="">
              Select experience level
            </option>

            <option value="beginner">
              Beginner
            </option>

            <option value="intermediate">
              Intermediate
            </option>

            <option value="advanced">
              Advanced
            </option>
          </select>
        </div>

        {/* Interview type selection */}
        <div style={{ marginBottom: "32px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "9px",
              fontSize: "15px",
              fontWeight: "600",
              color: "#e2e8f0"
            }}
          >
            🎯 Interview Type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              backgroundColor: "#0f172a",
              color: type ? "#ffffff" : "#94a3b8",
              border: "1px solid #475569",
              borderRadius: "10px",
              fontSize: "15px",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box"
            }}
          >
            <option value="">
              Select interview type
            </option>

            <option value="Technical">
              Technical
            </option>

            <option value="HR">
              HR
            </option>

            <option value="Mixed">
              Mixed
            </option>
          </select>
        </div>

        {/* Start interview button */}
        <button
          className="start-btn"
          onClick={handleStartInterview}
          style={{
            width: "100%",
            padding: "15px 20px",
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow:
              "0 10px 25px rgba(79, 70, 229, 0.25)"
          }}
        >
          🚀 Start Interview
        </button>

        {/* Bottom information */}
        <p
          style={{
            margin: "18px 0 0",
            textAlign: "center",
            color: "#64748b",
            fontSize: "13px"
          }}
        >
          Your interview will contain 5 questions.
        </p>
      </div>
    </div>
  );

}
export default InterviewSetup;