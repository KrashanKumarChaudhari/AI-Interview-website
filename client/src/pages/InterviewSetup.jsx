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
  // FUTURISTIC AI INTERVIEW SETUP UI
  // ==========================================

  return (
    <div className="setup-page">
      {/* Decorative background glow elements */}
      <div className="setup-glow setup-glow-one" />
      <div className="setup-glow setup-glow-two" />

      <main className="setup-card">
        {/* Page header */}
        <div className="setup-header">
          <div className="setup-icon">🤖</div>

          <div className="setup-eyebrow">
            <span className="setup-status-dot" />
            AI INTERVIEW STUDIO
          </div>

          <h1>
            Interview <span>Setup</span>
          </h1>

          <p className="setup-subtitle">
            Configure your session and get ready to showcase your skills.
          </p>
        </div>

        {/* Informational banner */}
        <div className="setup-info">
          <span className="setup-info-icon">✦</span>
          <div>
            <strong>Your next opportunity starts here</strong>
            <p>Personalize your interview experience with AI.</p>
          </div>
        </div>

        {/* Resume upload */}
        <section className="setup-field">
          <label htmlFor="resume-upload" className="setup-label">
            <span className="setup-label-icon">📄</span>
            Upload Resume
            <span className="setup-optional">OPTIONAL</span>
          </label>

          <label htmlFor="resume-upload" className="resume-dropzone">
            <span className="resume-upload-icon">↑</span>
            <span className="resume-upload-title">
              {resume ? "Resume selected" : "Choose your resume"}
            </span>
            <span className="resume-upload-hint">
              PDF, DOC or DOCX format
            </span>

            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files[0];

                if (file) {
                  setResume(file);
                  console.log("Selected Resume:", file);
                }
              }}
            />
          </label>

          {resume && (
            <div className="resume-selected">
              <span>✓</span>
              <span className="resume-file-name">{resume.name}</span>
              <button
                type="button"
                className="resume-remove"
                onClick={() => {
                  setResume(null);
                  const input = document.getElementById("resume-upload");
                  if (input) input.value = "";
                }}
                aria-label="Remove selected resume"
              >
                ×
              </button>
            </div>
          )}

          <p className="setup-help">
            Your resume helps AI generate personalized questions.
          </p>
        </section>

        {/* Interview configuration */}
        <div className="setup-section-heading">
          <span className="setup-section-line" />
          <span>CONFIGURE YOUR INTERVIEW</span>
          <span className="setup-section-line" />
        </div>

        <div className="setup-fields-grid">
          {/* Role */}
          <div className="setup-field">
            <label htmlFor="interview-role" className="setup-label">
              💼 Select Role
            </label>

            <select
              id="interview-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={role ? "setup-select has-value" : "setup-select"}
            >
              <option value="">Choose your role</option>
              <option value="Software Developer">Software Developer</option>
              <option value="Web Developer">Web Developer</option>
              <option value="Java Developer">Java Developer</option>
              <option value="Python Developer">Python Developer</option>
            </select>
          </div>

          {/* Experience */}
          <div className="setup-field">
            <label htmlFor="interview-experience" className="setup-label">
              📈 Experience Level
            </label>

            <select
              id="interview-experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={experience ? "setup-select has-value" : "setup-select"}
            >
              <option value="">Choose your level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Interview type */}
          <div className="setup-field">
            <label htmlFor="interview-type" className="setup-label">
              🎯 Interview Type
            </label>

            <select
              id="interview-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={type ? "setup-select has-value" : "setup-select"}
            >
              <option value="">Choose interview type</option>
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          {/* Question count */}
          <div className="setup-field">
            <label htmlFor="question-count" className="setup-label">
              🔢 Number of Questions
            </label>

            <select
              id="question-count"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="setup-select has-value"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={25}>25 Questions</option>
              <option value={30}>30 Questions</option>
            </select>
          </div>
        </div>

        {/* Interview summary */}
        <div className="setup-summary">
          <div className="setup-summary-icon">✧</div>
          <div>
            <strong>Your session at a glance</strong>
            <p>
              {questionCount} questions
              {role ? ` · ${role}` : ""}
              {experience ? ` · ${experience}` : ""}
              {type ? ` · ${type} interview` : ""}
            </p>
          </div>
        </div>

        {/* Start interview */}
        <button
          type="button"
          className="setup-start-btn"
          onClick={handleStartInterview}
        >
          <span>Start Interview</span>
          <span className="setup-button-arrow">→</span>
        </button>

        <p className="setup-footer">
          <span>🔒</span> Your interview session is ready when you are.
        </p>
      </main>
    </div>
  );
}

export default InterviewSetup;
