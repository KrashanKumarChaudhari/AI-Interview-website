import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get interview setup data from InterviewSetup page
  // Interview Setup se received data
const {
  role,
  experience,
  type,
  questions,
  resume
} = location.state || {};

// Resume received from Interview Setup
// Ye check karega ki selected resume Interview page tak aaya hai ya nahi.
useEffect(() => {
  if (resume) {
    console.log("Resume received:", resume);
    console.log("Resume name:", resume.name);
    console.log("Resume type:", resume.type);
    console.log("Resume size:", resume.size);
  }
}, [resume]);

  // Get logged-in user information from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Store the current answer typed by the user
  const [answer, setAnswer] = useState("");

  // Track the current question number
  const [questionNumber, setQuestionNumber] = useState(1);

  // Store all answers given during the interview
  // Empty string means that the question was skipped
  const [answers, setAnswers] = useState([]);

  // Track whether the interview is currently being saved
  const [saving, setSaving] = useState(false);
  // ==========================================
// VOICE ANSWER
// User microphone se answer bol sakega.
// Speech automatically text me convert hogi.
// ==========================================

// Check whether browser speech recognition support karta hai
const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

// Voice recognition object
const [recognition, setRecognition] = useState(null);

// Track whether microphone currently listening hai
const [isListening, setIsListening] = useState(false);

// ==========================================
// INITIALIZE VOICE RECOGNITION
// Browser ke speech recognition ko setup karta hai.
// ==========================================

useEffect(() => {
  // Agar browser speech recognition support nahi karta
  if (!SpeechRecognition) {
    console.log(
      "Speech recognition is not supported in this browser."
    );
    return;
  }

  // Speech recognition ka new object banana
  const speechRecognition = new SpeechRecognition();

  // User Hindi/English dono bol sakta hai.
  // Abhi English interview ke liye English set kar rahe hain.
  speechRecognition.lang = "en-IN";

  // Continuous false ka matlab:
  // ek baar recognition start hone par speech capture karega
  // aur pause hone par result dega.
  speechRecognition.continuous = true;

  // Interim results false:
  // final converted text hi milega.
  speechRecognition.interimResults = false;

  // Recognition object ko state me save karna
  setRecognition(speechRecognition);

}, []);

// ==========================================
// VOICE RESULT
// User jo bolega usko text me convert karega.
// ==========================================

// ==========================================
// VOICE RESULT
// User jo bolega usko text me convert karega.
// Multiple recognition results ko repeat nahi karega.
// ==========================================

useEffect(() => {
  // Agar recognition available nahi hai
  if (!recognition) {
    return;
  }

  // Speech recognition se result milne par
  recognition.onresult = (event) => {
    // Saare final results ko collect karna
    let finalTranscript = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {
      // Sirf final result lena
      if (event.results[i].isFinal) {
        finalTranscript +=
          event.results[i][0].transcript;
      }
    }

    // Agar final speech text mila hai
    if (finalTranscript.trim() !== "") {
      setAnswer((previousAnswer) => {
        // Existing written/voice answer ke saath
        // naya spoken text add karna
        if (previousAnswer.trim() !== "") {
          return (
            previousAnswer.trim() +
            " " +
            finalTranscript.trim()
          );
        }

        return finalTranscript.trim();
      });
    }
  };

  // Agar recognition me error aaye
  recognition.onerror = (event) => {
    console.error(
      "Speech recognition error:",
      event.error
    );

    // Sirf serious error par listening stop
    if (
      event.error === "not-allowed" ||
      event.error === "service-not-allowed"
    ) {
      setIsListening(false);
    }
  };

  // Recognition automatically end ho to
  // state ko false nahi karna, kyunki continuous mode hai.
  recognition.onend = () => {
    console.log("Voice recognition ended.");
  };

  // Component cleanup
  return () => {
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
  };
}, [recognition]);

// ==========================================
// START / STOP VOICE RECOGNITION
// Microphone ko start aur stop karega.
// ==========================================

const handleVoiceAnswer = () => {
  // Browser voice recognition support check
  if (!SpeechRecognition) {
    alert(
      "Voice input is not supported in this browser. Please use Google Chrome."
    );
    return;
  }

  // Agar recognition object available nahi hai
  if (!recognition) {
    alert("Voice recognition is not ready. Please try again.");
    return;
  }

  // Agar microphone already listening hai
  // to recognition stop kar do
  if (isListening) {
    recognition.stop();
    setIsListening(false);
    return;
  }

  // Microphone start karna
  recognition.start();

  // Listening status ON
  setIsListening(true);
};


  // ==========================================
  // QUESTION VOICE
  // Question change hone par browser question
  // ko automatically voice me bolega.
  // ==========================================

  // ==========================================
// QUESTION VOICE + VIDEO CONTROL
// Question start hote hi video play hoga.
// Question ki voice khatam hote hi video pause hoga.
// ==========================================

useEffect(() => {
  // Agar questions available nahi hain to kuch nahi karna
  if (!questions || questions.length === 0) {
    return;
  }

  // Current question ko get karna
  const currentQuestion =
    questions[questionNumber - 1];

  // Pehle se chal rahi speech ko stop karna
  window.speechSynthesis.cancel();

  // Video element ko find karna
  const video = document.querySelector(
    "video"
  );

  // Video ko question ke beginning se start karna
  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  // Current question ke liye speech banana
  const speech = new SpeechSynthesisUtterance(
    currentQuestion
  );

  // Voice ki speed
  speech.rate = 0.9;

  // Voice ka pitch
  speech.pitch = 1;

  // Voice ki volume
  speech.volume = 1;

  // ==========================================
  // VOICE KHATAM HONE PAR VIDEO PAUSE
  // ==========================================

  speech.onend = () => {
    if (video) {
      video.pause();
    }
  };

  // Question ko bolna
  window.speechSynthesis.speak(speech);

  // Question change hone par previous
  // speech aur video ko stop karna
  return () => {
    window.speechSynthesis.cancel();

    if (video) {
      video.pause();
    }
  };
}, [questionNumber, questions]);
  // ==========================================
  // LOGIN PROTECTION
  // ==========================================

  useEffect(() => {
    // If there is no logged-in user, redirect to Login
    if (!userId) {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  // If user is not logged in, don't render the interview
  if (!userId) {
    return null;
  }

  // ==========================================
  // INTERVIEW DATA CHECK
  // ==========================================

  // If interview setup data is missing, show an error
  if (!questions || questions.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "20px",
          padding: "20px"
        }}
      >
        <h2>Interview data not found.</h2>

        <button
          onClick={() => navigate("/interview-setup")}
          style={{
            padding: "12px 22px",
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Back to Interview Setup
        </button>
      </div>
    );
  }

  // Calculate the current score from submitted non-empty answers
  const score = answers.filter(
    (ans) => ans.trim() !== ""
  ).length;

  // ==========================================
  // FINISH INTERVIEW
  // ==========================================

  // Save the complete interview after the final question
  const finishInterview = async (updatedAnswers) => {
    // Make sure a logged-in user still exists
    if (!userId) {
      alert("Please login before starting an interview.");
      navigate("/login");
      return;
    }

    // Start saving process
    setSaving(true);

    // Stop any currently playing question voice
    window.speechSynthesis.cancel();

    // Calculate final score
    // Skipped questions contain "" and therefore get 0 points
    const finalScore = updatedAnswers.filter(
      (ans) => ans.trim() !== ""
    ).length;

    try {
      // Send the complete interview attempt to the backend
      const response = await fetch(
        "http://localhost:5000/api/interviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            // Logged-in user's ID
            user_id: userId,

            // Interview configuration
            role: role,
            experience: experience,
            interview_type: type,

            // Final score
            score: finalScore,

            // Total number of questions
            total_questions: questions.length,

            // Save all questions
            questions: questions,

            // Save all user answers
            // Empty string represents a skipped question
            answers: updatedAnswers
          })
        }
      );

      // Convert backend response to JSON
      const data = await response.json();

      // Check whether the interview was actually saved
      if (!response.ok) {
        console.error("Backend save error:", data);

        alert(
          data.message || "Failed to save interview result."
        );

        setSaving(false);
        return;
      }
    

      // Confirm successful save in browser console
      console.log(
        "Interview saved successfully:",
        data.interview
      );

      // Go to Result page only after successful database save
      navigate("/result", {
        state: {
          score: finalScore,
          answers: updatedAnswers,
          questions: questions
        }
      });
    } catch (error) {
      // Handle server connection or network errors
      console.error(
        "Error saving interview result:",
        error
      );

      alert(
        "Unable to save interview. Please make sure the backend server is running."
      );

      setSaving(false);
    }
  };

  // ==========================================
  // SUBMIT ANSWER
  // ==========================================

  const handleSubmitAnswer = async () => {
    // Prevent submitting an empty answer
    if (answer.trim() === "") {
      alert("Please enter your answer before submitting.");
      return;
    }

    // Stop question voice when user submits the answer
    window.speechSynthesis.cancel();

    // Add the current answer to the answers array
    const updatedAnswers = [
      ...answers,
      answer.trim()
    ];

    // Update answers state
    setAnswers(updatedAnswers);

    // Clear the textarea
    setAnswer("");

    // If more questions are remaining, move to the next question
    if (questionNumber < questions.length) {
      setQuestionNumber(questionNumber + 1);
      return;
    }

    // Final question has been submitted
    await finishInterview(updatedAnswers);
  };

  // ==========================================
  // SKIP CURRENT QUESTION
  // ==========================================

  const handleSkipQuestion = async () => {
    // Ask the user for confirmation before skipping
    const confirmSkip = window.confirm(
      "Are you sure you want to skip this question?"
    );

    // If user clicks Cancel, stay on the same question
    if (!confirmSkip) {
      return;
    }

    // Stop question voice when skipping
    window.speechSynthesis.cancel();

    // Store an empty answer for the skipped question
    const updatedAnswers = [
      ...answers,
      ""
    ];

    // Update answers state
    setAnswers(updatedAnswers);

    // Clear the textarea
    setAnswer("");

    // If more questions are remaining, move to the next question
    if (questionNumber < questions.length) {
      setQuestionNumber(questionNumber + 1);
      return;
    }

    // If the final question is skipped,
    // save the complete interview
    await finishInterview(updatedAnswers);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        padding: "40px 20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#172554",
          padding: "40px",
          borderRadius: "18px",
          border: "1px solid #3730a3",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)"
        }}
      >
        {/* Interview heading */}
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "32px"
          }}
        >
          AI Mock Interview
        </h1>

        <p
          style={{
            color: "#a5b4fc",
            marginBottom: "30px"
          }}
        >
          Answer the questions to complete your interview.
        </p>

        {/* Interview configuration information */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
            border: "1px solid #334155"
          }}
        >
          <p style={{ margin: "0 0 10px" }}>
            <strong>Role:</strong> {role}
          </p>

          <p style={{ margin: "0 0 10px" }}>
            <strong>Experience:</strong> {experience}
          </p>

          <p style={{ margin: "0 0 10px" }}>
            <strong>Interview Type:</strong> {type}
          </p>

          <p style={{ margin: 0 }}>
            <strong>Total Questions:</strong>{" "}
            {questions.length}
          </p>
        </div>

        {/* Interview progress */}
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              margin: "0 0 8px",
              color: "#cbd5e1"
            }}
          >
            Question {questionNumber} of {questions.length}
          </p>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#334155",
              borderRadius: "10px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${
                  (questionNumber / questions.length) * 100
                }%`,
                height: "100%",
                backgroundColor: "#6366f1",
                borderRadius: "10px"
              }}
            ></div>
          </div>
        </div>

        {/* ==========================================
            AI INTERVIEWER VIDEO
            The key forces the video element to
            restart whenever the question changes.
            ========================================== */}
        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            backgroundColor: "#020617",
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "20px",
            border: "1px solid #334155"
          }}
        >
          <video
            key={questionNumber}
            src="/interviewer/interviewer.mp4"
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block"
            }}
          />
        </div>

        {/* Current interview question */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "20px",
            border: "1px solid #334155"
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#a5b4fc",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "uppercase"
            }}
          >
            Interviewer Question
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              lineHeight: "1.5"
            }}
          >
            {questions[questionNumber - 1]}
          </h2>
        </div>

        {/* ==========================================
    VOICE ANSWER BUTTON
    User microphone se answer bol sakta hai.
    ========================================== */}

<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px"
  }}
>
  <button
    type="button"
    onClick={handleVoiceAnswer}
    disabled={saving}
    style={{
      padding: "10px 18px",
      backgroundColor: isListening
        ? "#dc2626"
        : "#4f46e5",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: saving
        ? "not-allowed"
        : "pointer",
      fontSize: "14px",
      fontWeight: "600"
    }}
  >
    {isListening
      ? "🛑 Stop Speaking"
      : "🎤 Speak Answer"}
  </button>
</div>

        {/* Answer input */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows="8"
          disabled={saving}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "15px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            border: "1px solid #475569",
            borderRadius: "10px",
            resize: "vertical",
            fontSize: "16px",
            outline: "none",
            marginBottom: "20px",
            opacity: saving ? 0.6 : 1
          }}
        />

        {/* Submit and Skip buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px"
          }}
        >
          {/* Skip current question */}
          <button
            onClick={handleSkipQuestion}
            disabled={saving}
            style={{
              padding: "12px 24px",
              backgroundColor: saving
                ? "#64748b"
                : "#475569",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: saving
                ? "not-allowed"
                : "pointer",
              fontSize: "15px",
              fontWeight: "600"
            }}
          >
            Skip Question
          </button>

          {/* Submit answer / Finish interview */}
          <button
            onClick={handleSubmitAnswer}
            disabled={saving}
            style={{
              padding: "12px 24px",
              backgroundColor: saving
                ? "#64748b"
                : "#4f46e5",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: saving
                ? "not-allowed"
                : "pointer",
              fontSize: "15px",
              fontWeight: "600"
            }}
          >
            {saving
              ? "Saving Interview..."
              : questionNumber === questions.length
              ? "Finish Interview"
              : "Submit Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Interview;