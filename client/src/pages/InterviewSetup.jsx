import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewSetup() {
  // ==========================================
  // INTERVIEW SETUP STATES
  // ==========================================

  // Store the selected interview role
  const [role, setRole] = useState("");

  // Store the selected experience level
  const [experience, setExperience] = useState("");

  // Store the selected interview type
  const [type, setType] = useState("");

  // Selected resume file ko store karega
  const [resume, setResume] = useState(null);

  // Interview me kitne questions chahiye
  const [questionCount, setQuestionCount] = useState(10);

  // Used to navigate to the interview page
  const navigate = useNavigate();

  // ==========================================
  // LOGGED-IN USER
  // ==========================================

  // Get the logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const userId = user?.id;

  // ==========================================
  // LOGIN PROTECTION
  // ==========================================

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
  // FALLBACK INTERVIEW QUESTION GENERATOR
  // ==========================================
  //
  // Agar Gemini API kisi reason se questions
  // generate nahi kar pati, to ye function
  // backup questions generate karega.
  //
  // Resume optional hai.
  // Role / Experience / Type bhi optional ho sakte hain
  // jab resume available ho.
  // ==========================================

  const generateResumeQuestions = (
    resumeText,
    role,
    experience,
    type,
    questionCount
  ) => {
    // Resume text ko lowercase me convert karna
    const text = (resumeText || "").toLowerCase();

    // Role ko safely lowercase me convert karna
    const selectedRole = (role || "").toLowerCase();

    // Experience ko safely lowercase me convert karna
    const selectedExperience =
      (experience || "").toLowerCase();

    // Interview type ko safely lowercase me convert karna
    const selectedType =
      (type || "").toLowerCase();

    // Questions store karne ke liye array
    const questions = [];

    // ==========================================
    // QUESTION 1 - GENERAL
    // ==========================================

    questions.push(
      "Tell me about yourself and your background."
    );

    // ==========================================
    // ROLE BASED QUESTION
    // ==========================================

    if (selectedRole.includes("python")) {
      questions.push(
        "Why have you chosen Python as your preferred programming language?"
      );
    } else if (selectedRole.includes("java")) {
      questions.push(
        "Why have you chosen Java as your preferred programming language?"
      );
    } else if (selectedRole.includes("web")) {
      questions.push(
        "What web development technologies have you worked with?"
      );
    } else if (selectedRole.includes("software")) {
      questions.push(
        "What software development practices are you familiar with?"
      );
    } else {
      questions.push(
        "What technical skills are you most confident about?"
      );
    }

    // ==========================================
    // RESUME BASED QUESTION
    // ==========================================

    if (text.includes("python")) {
      questions.push(
        "You have mentioned Python in your resume. How have you used Python in your projects?"
      );
    } else if (text.includes("java")) {
      questions.push(
        "You have mentioned Java in your resume. How have you used Java in your projects?"
      );
    } else if (text.includes("flask")) {
      questions.push(
        "You have mentioned Flask in your resume. How did you use Flask in your project?"
      );
    } else if (text.includes("mysql")) {
      questions.push(
        "You have mentioned MySQL in your resume. How did you use MySQL in your projects?"
      );
    } else if (text.includes("javascript")) {
      questions.push(
        "You have mentioned JavaScript in your resume. Where have you used JavaScript?"
      );
    } else if (text.includes("react")) {
      questions.push(
        "You have mentioned React in your resume. How have you used React in your projects?"
      );
    } else if (text.includes("project")) {
      questions.push(
        "Which project mentioned in your resume are you most confident about?"
      );
    } else {
      questions.push(
        "Which skill mentioned in your resume are you most confident about?"
      );
    }

    // ==========================================
    // INTERNSHIP / PROJECT QUESTION
    // ==========================================

    if (text.includes("internship")) {
      questions.push(
        "What did you learn during your internship, and what responsibilities did you handle?"
      );
    } else if (text.includes("project")) {
      questions.push(
        "Explain one project from your resume and describe the main challenge you faced."
      );
    } else if (
      selectedExperience.includes("advanced")
    ) {
      questions.push(
        "Explain a complex technical problem you solved and describe your approach."
      );
    } else {
      questions.push(
        "Tell me about a technical problem you have worked on and how you solved it."
      );
    }

    // ==========================================
    // EXPERIENCE BASED QUESTION
    // ==========================================

    if (
      selectedExperience.includes("beginner")
    ) {
      questions.push(
        "Explain one technical concept that you understand well."
      );
    } else if (
      selectedExperience.includes("intermediate")
    ) {
      questions.push(
        "Describe a technical challenge you faced in a project and how you solved it."
      );
    } else if (
      selectedExperience.includes("advanced")
    ) {
      questions.push(
        "Describe a complex technical problem from your experience and explain how you solved it."
      );
    } else {
      questions.push(
        "Which technical skill would you like to improve further?"
      );
    }

    // ==========================================
    // INTERVIEW TYPE BASED QUESTION
    // ==========================================

    if (selectedType.includes("technical")) {
      questions.push(
        "How do you approach solving a technical problem?"
      );
    } else if (selectedType.includes("hr")) {
      questions.push(
        "What are your strengths and weaknesses?"
      );
    } else if (selectedType.includes("mixed")) {
      questions.push(
        "Tell me about a project you worked on and the biggest challenge you faced."
      );
    } else {
      questions.push(
        "Why should we hire you for this role?"
      );
    }

    // ==========================================
    // ADDITIONAL BACKUP QUESTIONS
    // ==========================================

    questions.push(
      "How do you handle deadlines and pressure?"
    );

    questions.push(
      "How do you keep yourself updated with new technologies?"
    );

    questions.push(
      "Describe a situation where you had to learn something quickly."
    );

    questions.push(
      "How do you approach debugging when your code is not working?"
    );

    questions.push(
      "What is one technical achievement you are proud of?"
    );

    questions.push(
      "How do you work with other team members on a project?"
    );

    questions.push(
      "What are your career goals for the next few years?"
    );

    questions.push(
      "Why are you interested in this role?"
    );

    // Selected question count ke according
    // questions return karna
    return questions.slice(
      0,
      Number(questionCount) || 10
    );
  };

  // ==========================================
  // START INTERVIEW
  // ==========================================

  const handleStartInterview = async () => {
    // ==========================================
    // VALIDATION
    // ==========================================
    //
    // User ke paas:
    //
    // 1. Resume ho
    // OR
    //
    // 2. Role + Experience + Interview Type ho
    //
    // Dono me se koi ek available hona chahiye.
    // ==========================================

    if (
      !resume &&
      (!role || !experience || !type)
    ) {
      alert(
        "Please upload a resume OR select Role, Experience and Interview Type."
      );

      return;
    }

    try {
      // ==========================================
      // RESUME UPLOAD
      // ==========================================

      let uploadedResume = null;

      // Resume selected hai tabhi upload API call hogi
      if (resume) {
        const formData = new FormData();

        // Selected resume file ko FormData me add karna
        formData.append("resume", resume);

        const response = await fetch(
          "http://localhost:5000/api/upload-resume",
          {
            method: "POST",
            body: formData
          }
        );

        const data = await response.json();

        // Resume upload fail hone par process stop karo
        if (!response.ok) {
          alert(
            data.message ||
              "Resume upload failed."
          );

          return;
        }

        // Backend se resume information save karna
        uploadedResume = data;

        console.log(
          "================================="
        );

        console.log(
          "Resume uploaded successfully:"
        );

        console.log(data);

        console.log(
          "================================="
        );
      }

      // ==========================================
      // EXTRACTED RESUME TEXT
      // ==========================================

      const resumeText =
        uploadedResume?.resumeText || "";

      // ==========================================
      // FALLBACK QUESTIONS
      // ==========================================
      //
      // Pehle local backup questions generate
      // kar lenge.
      // Agar Gemini successfully questions deta hai,
      // to Gemini questions use honge.
      // ==========================================

      const fallbackQuestions =
        generateResumeQuestions(
          resumeText,
          role,
          experience,
          type,
          questionCount
        );

      // ==========================================
      // GEMINI AI QUESTION GENERATION
      // ==========================================

      let personalizedQuestions =
        fallbackQuestions;

      try {
        console.log(
          "================================="
        );

        console.log(
          "Generating questions using Gemini AI..."
        );

        console.log(
          "Question Count:",
          questionCount
        );

        console.log(
          "================================="
        );

        const aiResponse = await fetch(
          "http://localhost:5000/api/generate-interview-questions",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              resumeText,
              role,
              experience,
              type,
              questionCount
            })
          }
        );

        const aiData =
          await aiResponse.json();

        // Gemini successfully questions return kare
        if (
          aiResponse.ok &&
          aiData.success &&
          Array.isArray(aiData.questions) &&
          aiData.questions.length > 0
        ) {
          personalizedQuestions =
            aiData.questions.slice(
              0,
              Number(questionCount)
            );

          console.log(
            "================================="
          );

          console.log(
            "Gemini AI Questions:"
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
        } else {
          console.log(
            "Gemini questions unavailable. Using fallback questions."
          );
        }
      } catch (aiError) {
        // Gemini fail hone par interview ko
        // completely stop nahi karna.
        // Local fallback questions use honge.

        console.error(
          "Gemini question generation error:",
          aiError
        );

        console.log(
          "Using fallback interview questions."
        );
      }

      // ==========================================
      // FINAL QUESTION SAFETY CHECK
      // ==========================================

      if (
        !personalizedQuestions ||
        personalizedQuestions.length === 0
      ) {
        alert(
          "Unable to generate interview questions. Please try again."
        );

        return;
      }

      // ==========================================
      // INTERVIEW PAGE PAR DATA BHEJNA
      // ==========================================

      navigate("/interview", {
        state: {
          // Selected role
          role,

          // Selected experience
          experience,

          // Selected interview type
          type,

          // User selected question count
          questionCount,

          // Final questions
          questions:
            personalizedQuestions,

          // Extracted resume text
          resumeText,

          // Uploaded resume information
          resume: uploadedResume
        }
      });
    } catch (error) {
      // Unexpected error console me show karna
      console.error(
        "Interview start error:",
        error
      );

      // User ko error message
      alert(
        "Unable to start interview. Please try again."
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

        {/* ==========================================
            RESUME UPLOAD
            ========================================== */}

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
              const file =
                e.target.files[0];

              if (file) {
                // Selected resume ko state me store karna
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

        {/* ==========================================
            ROLE SELECTION
            ========================================== */}

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

        {/* ==========================================
            QUESTION COUNT
            ========================================== */}

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
            🔢 Number of Questions
          </label>

          <select
            value={questionCount}
            onChange={(e) =>
              setQuestionCount(
                Number(e.target.value)
              )
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              border: "1px solid #475569",
              borderRadius: "10px",
              fontSize: "15px",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box"
            }}
          >
            <option value={5}>
              5 Questions
            </option>

            <option value={10}>
              10 Questions
            </option>

            <option value={15}>
              15 Questions
            </option>

            <option value={20}>
              20 Questions
            </option>

            <option value={25}>
              25 Questions
            </option>

            <option value={30}>
              30 Questions
            </option>
          </select>
        </div>

        {/* ==========================================
            EXPERIENCE SELECTION
            ========================================== */}

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

        {/* ==========================================
            INTERVIEW TYPE
            ========================================== */}

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

        {/* ==========================================
            START INTERVIEW BUTTON
            ========================================== */}

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

        {/* ==========================================
            BOTTOM INFORMATION
            ========================================== */}

        <p
          style={{
            margin: "18px 0 0",
            textAlign: "center",
            color: "#64748b",
            fontSize: "13px"
          }}
        >
          Your interview will contain{" "}
          {questionCount} questions.
        </p>
      </div>
    </div>
  );
}

export default InterviewSetup;