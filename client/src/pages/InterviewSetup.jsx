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

  // ==========================================
  // RESUME-BASED PERSONALIZED QUESTIONS
  // Role + Experience + Interview Type + Resume
  // ke basis par exactly 5 questions generate karega.
  // ==========================================

  const generateResumeQuestions = (
    resumeText,
    role,
    experience,
    type
  ) => {
    // Agar resume available nahi hai to normal questions use honge
    if (!resumeText) {
      return [
        "Tell me about yourself.",
        "What are your technical skills?",
        "Describe a challenging project you worked on.",
        "How do you handle pressure and deadlines?",
        "Why should we hire you?"
      ];
    }

    // Resume text ko lowercase me convert karna
    const text = (resumeText || "").toLowerCase();

    // Role, Experience aur Interview Type ko safely lowercase me convert karna
    const selectedRole = (role || "").toLowerCase();
    const selectedExperience = (experience || "").toLowerCase();
    const selectedType = (type || "").toLowerCase();

    // Final 5 questions
    const personalizedQuestions = [];

    // ==========================================
    // QUESTION 1 - BASIC
    // ==========================================

    personalizedQuestions.push(
      "Tell me about yourself and your background."
    );

    // ==========================================
    // QUESTION 2 - ROLE BASED
    // ==========================================

    if (selectedRole.includes("python")) {
      personalizedQuestions.push(
        "Why have you chosen Python as your preferred programming language?"
      );
    } 
    else if (selectedRole.includes("java")) {
      personalizedQuestions.push(
        "Why have you chosen Java as your preferred programming language?"
      );
    } 
    else if (selectedRole.includes("web")) {
      personalizedQuestions.push(
        "What web development technologies have you worked with?"
      );
    } 
    else {
      personalizedQuestions.push(
        "What software development practices have you followed in your projects?"
      );
    }

    // ==========================================
    // QUESTION 3 - RESUME BASED
    // ==========================================

    if (text.includes("python")) {
      personalizedQuestions.push(
        "You have mentioned Python in your resume. How have you used Python in your projects?"
      );
    } 
    else if (text.includes("flask")) {
      personalizedQuestions.push(
        "You have mentioned Flask in your resume. How did you use Flask in your project?"
      );
    } 
    else if (text.includes("mysql")) {
      personalizedQuestions.push(
        "You have mentioned MySQL in your resume. How did you use MySQL in your projects?"
      );
    } 
    else if (text.includes("javascript")) {
      personalizedQuestions.push(
        "You have mentioned JavaScript in your resume. Where have you used JavaScript?"
      );
    } 
    else {
      personalizedQuestions.push(
        "Which project mentioned in your resume are you most confident about?"
      );
    }

    // ==========================================
    // QUESTION 4 - RESUME / EXPERIENCE BASED
    // ==========================================

    if (text.includes("internship")) {
      personalizedQuestions.push(
        "What did you learn during your internship, and what responsibilities did you handle?"
      );
    } 
    else if (text.includes("flask")) {
      personalizedQuestions.push(
        "Explain how you used Flask and MySQL together in your project."
      );
    } 
    else if (text.includes("project")) {
      personalizedQuestions.push(
        "Explain one project from your resume and describe the main challenge you faced."
      );
    } 
    else if (selectedExperience.includes("advanced")) {
      personalizedQuestions.push(
        "Explain a complex technical problem from your experience and how you solved it."
      );
    } 
    else {
      personalizedQuestions.push(
        "Explain one technical skill mentioned in your resume."
      );
    }

    // ==========================================
    // QUESTION 5 - EXPERIENCE + INTERVIEW TYPE
    // ==========================================

    if (selectedType.includes("technical")) {

      if (selectedExperience.includes("beginner")) {
        personalizedQuestions.push(
          "Explain one technical concept from your resume in simple words."
        );
      } 
      else if (selectedExperience.includes("intermediate")) {
        personalizedQuestions.push(
          "Describe a technical challenge you faced in one of your projects and how you solved it."
        );
      } 
      else {
        personalizedQuestions.push(
          "Explain a complex technical problem from your experience and discuss the approach you used to solve it."
        );
      }

    } 
    else if (selectedType.includes("hr")) {

      personalizedQuestions.push(
        "What are your strengths, and how do they help you in your professional work?"
      );

    } 
    else {

      personalizedQuestions.push(
        "Tell me about a technical project you worked on and the main challenge you faced."
      );

    }

    // Exactly 5 questions return karna
    return personalizedQuestions.slice(0, 5);
  };

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
          alert(
            data.message || "Resume upload failed."
          );
          return;
        }

        // Backend se received resume information
        uploadedResume = data;

        console.log(
          "Resume uploaded successfully:",
          data
        );
      }

      // ==========================================
      // GENERATE PERSONALIZED QUESTIONS
      // ==========================================

      const personalizedQuestions =
        generateResumeQuestions(
          uploadedResume?.resumeText || "",
          role,
          experience,
          type
        );

      // ==========================================
      // GENERATED QUESTIONS CONSOLE ME SHOW KARNA
      // ==========================================

      console.log(
        "================================="
      );

      console.log(
        "Personalized Interview Questions:"
      );

      personalizedQuestions.forEach(
        (question, index) => {
          console.log(
            `Question ${index + 1}: ${question}`
          );
        }
      );

      console.log(
        "================================="
      );

      // ==========================================
      // INTERVIEW PAGE PAR NAVIGATE KARNA
      // ==========================================

      navigate("/interview", {
        state: {
          role,
          experience,
          type,

          // Generated personalized questions
          questions: personalizedQuestions,

          // Resume ki complete extracted text
          resumeText:
            uploadedResume?.resumeText || "",

          // Uploaded resume ki information
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

  // ==========================================
  // INTERVIEW SETUP UI
  // ==========================================

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
          <span style={{ fontSize: "20px" }}>
            ✨
          </span>

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
        <div
          style={{
            marginBottom: "30px"
          }}
        >
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

                console.log(
                  "Selected Resume:",
                  file
                );
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

              <span
                style={{
                  color: "#ffffff",
                  fontWeight: "600"
                }}
              >
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
        <div
          style={{
            marginBottom: "24px"
          }}
        >
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
            onChange={(e) =>
              setRole(e.target.value)
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              backgroundColor: "#0f172a",
              color: role
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
              Select role
            </option>

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
        <div
          style={{
            marginBottom: "24px"
          }}
        >
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
            onChange={(e) =>
              setExperience(e.target.value)
            }
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
        <div
          style={{
            marginBottom: "32px"
          }}
        >
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
            onChange={(e) =>
              setType(e.target.value)
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              backgroundColor: "#0f172a",
              color: type
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