import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================
  // INTERVIEW SETUP DATA
  // Interview Setup page se received data
  // ==========================================

  const {
    role,
    experience,
    type,
    questionCount,
    questions,
    resumeText,
    resume
  } = location.state || {};

  // Selected question count check karna
  useEffect(() => {
    console.log(
      "Selected Question Count:",
      questionCount
    );
  }, [questionCount]);

  // ==========================================
  // RESUME TEXT DEBUG
  // ==========================================

  useEffect(() => {
    if (resumeText) {
      console.log("=================================");
      console.log(
        "Resume Text received in Interview:"
      );
      console.log(resumeText);
      console.log("=================================");
    }
  }, [resumeText]);

  // ==========================================
  // RESUME DEBUG
  // ==========================================

  useEffect(() => {
    if (resume) {
      console.log("Resume received:", resume);
      console.log("Resume name:", resume.name);
      console.log("Resume type:", resume.type);
      console.log("Resume size:", resume.size);
    }
  }, [resume]);

  // ==========================================
  // LOGGED-IN USER
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const userId = user?.id;

  // ==========================================
  // ANSWER STATES
  // ==========================================

  // Current question ka answer
  const [answer, setAnswer] = useState("");

  // Current question number
  const [questionNumber, setQuestionNumber] =
    useState(1);

  // Saare answers store honge
  // Empty string = skipped question
  const [answers, setAnswers] = useState(() =>
    Array.from(
      { length: questions?.length || 0 },
      () => ""
    )
  );

  // Interview save/evaluation process
  const [saving, setSaving] = useState(false);

  // ==========================================
  // CURRENT QUESTION
  // Replay aur question speech isi question
  // ko use karenge.
  // ==========================================

  const currentQuestion =
    questions?.[questionNumber - 1] || "";

  // ==========================================
  // VOICE ANSWER
  // User microphone se answer bol sakega.
  // Speech automatically text me convert hogi.
  // ==========================================

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  // Voice recognition object
  const [recognition, setRecognition] =
    useState(null);

  // Microphone listening status
  const [isListening, setIsListening] =
    useState(false);

  // ==========================================
  // INTERVIEWER PAUSE / RESUME STATE
  // Video + question voice ke liye.
  // ==========================================

  const [isPaused, setIsPaused] =
    useState(false);

  // ==========================================
  // INITIALIZE VOICE RECOGNITION
  // ==========================================

  useEffect(() => {
    // Browser speech recognition support check
    if (!SpeechRecognition) {
      console.log(
        "Speech recognition is not supported in this browser."
      );

      return;
    }

    // Speech recognition object
    const speechRecognition =
      new SpeechRecognition();

    // English India voice recognition
    speechRecognition.lang = "en-IN";

    // Continuous speech recognition
    speechRecognition.continuous = true;

    // Sirf final result lena
    speechRecognition.interimResults = false;

    // Recognition object save karna
    setRecognition(
      speechRecognition
    );
  }, []);

  // ==========================================
  // VOICE RESULT
  // User jo bolega usko text me convert karega.
  // ==========================================

  useEffect(() => {
    if (!recognition) {
      return;
    }

    // Speech result receive hone par
    recognition.onresult = (event) => {
      let finalTranscript = "";

      // Saare final speech results collect karna
      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        if (
          event.results[i].isFinal
        ) {
          finalTranscript +=
            event.results[i][0]
              .transcript;
        }
      }

      // Agar speech text mila hai
      if (
        finalTranscript.trim() !== ""
      ) {
        setAnswer(
          (previousAnswer) => {
            // Existing answer ke end me
            // new speech add karna
            if (
              previousAnswer.trim() !== ""
            ) {
              return (
                previousAnswer.trim() +
                " " +
                finalTranscript.trim()
              );
            }

            return finalTranscript.trim();
          }
        );
      }
    };

    // Speech recognition error
    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      // Serious permission error
      if (
        event.error ===
          "not-allowed" ||
        event.error ===
          "service-not-allowed"
      ) {
        setIsListening(false);
      }
    };

    // Recognition end
    recognition.onend = () => {
      console.log(
        "Voice recognition ended."
      );
    };

    // Cleanup
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [recognition]);

  // ==========================================
  // START / STOP VOICE RECOGNITION
  // ==========================================

  const handleVoiceAnswer = () => {
    // Browser support check
    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );

      return;
    }

    // Recognition ready check
    if (!recognition) {
      alert(
        "Voice recognition is not ready. Please try again."
      );

      return;
    }

    // Agar already listening hai
    if (isListening) {
      recognition.stop();

      setIsListening(false);

      return;
    }

    // Microphone start
    recognition.start();

    // Listening ON
    setIsListening(true);
  };

  // ==========================================
  // QUESTION VOICE + VIDEO CONTROL
  // Question change hone par:
  //
  // 1. Video beginning se start
  // 2. Question voice start
  // 3. Voice complete hone par video pause
  // ==========================================

  useEffect(() => {
    // Questions available nahi hain
    if (
      !questions ||
      questions.length === 0
    ) {
      return;
    }

    // Previous speech stop
    window.speechSynthesis.cancel();

    // New question start hote hi
    // pause state false karna
    setIsPaused(false);

    // Video element find karna
    const video =
      document.getElementById(
        "interviewer-video"
      );

    // Video beginning se start.
    // Voice video se lambi ho sakti hai,
    // isliye video voice complete hone tak loop karega.
    if (video) {
      video.loop = true;

      video.currentTime = 0;

      video
        .play()
        .catch(() => {});
    }

    // Question speech create karna
    const speech =
      new SpeechSynthesisUtterance(
        currentQuestion
      );

    // Voice settings
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    // Voice complete hone par video pause
    speech.onend = () => {
      if (video) {
        // Question voice khatam hote hi
        // video pause aur reset karo.
        video.pause();

        video.currentTime = 0;
      }

      // Question complete ho gaya,
      // isliye pause state false rakho.
      setIsPaused(false);
    };

    // Question speak karna
    window.speechSynthesis.speak(
      speech
    );

    // Question change hone par cleanup
    return () => {
      window.speechSynthesis.cancel();

      if (video) {
        video.pause();

        video.currentTime = 0;

        video.loop = false;
      }

      setIsPaused(false);
    };
  }, [questionNumber, questions]);

  // ==========================================
  // REPLAY CURRENT QUESTION
  // Video + current question voice dobara
  // beginning se start hogi.
  // ==========================================

  const handleReplayQuestion = () => {
    // Pehle chal rahi question voice ko stop karo
    window.speechSynthesis.cancel();

    // Replay ke baad pause state false
    setIsPaused(false);

    // Current interviewer video find karo
    const video =
      document.getElementById(
        "interviewer-video"
      );

    // Video ko beginning se start karo
    if (video) {
      video.loop = true;

      video.currentTime = 0;

      video
        .play()
        .catch(() => {});
    }

    // Current question ki voice dobara create karo
    const replaySpeech =
      new SpeechSynthesisUtterance(
        currentQuestion
      );

    // Same voice settings
    replaySpeech.rate = 0.9;
    replaySpeech.pitch = 1;
    replaySpeech.volume = 1;

    // Voice complete hone par
    // video stop + reset
    replaySpeech.onend = () => {
      if (video) {
        video.pause();

        video.currentTime = 0;
      }

      setIsPaused(false);
    };

    // Current question ko dobara speak karo
    window.speechSynthesis.speak(
      replaySpeech
    );
  };

  // ==========================================
  // PAUSE / RESUME INTERVIEWER
  // Video aur question voice dono ko
  // pause/resume karega.
  // ==========================================

  const handlePauseResume = () => {
    // Current interviewer video find karo
    const video =
      document.getElementById(
        "interviewer-video"
      );

    // ==========================================
    // PAUSE
    // ==========================================

    if (!isPaused) {
      // Video pause karo
      if (video) {
        video.pause();
      }

      // Question voice pause karo
      window.speechSynthesis.pause();

      // Pause state ON
      setIsPaused(true);

      return;
    }

    // ==========================================
    // RESUME
    // ==========================================

    // Video wahi se resume karo
    if (video) {
      video
        .play()
        .catch(() => {});
    }

    // Question voice wahi se resume karo
    window.speechSynthesis.resume();

    // Pause state OFF
    setIsPaused(false);
  };

  // ==========================================
  // LOGIN PROTECTION
  // ==========================================

  useEffect(() => {
    if (!userId) {
      navigate("/login", {
        replace: true
      });
    }
  }, [userId, navigate]);

  // Logged-in user nahi hai
  if (!userId) {
    return null;
  }

  // ==========================================
  // INTERVIEW DATA CHECK
  // ==========================================

  if (
    !questions ||
    questions.length === 0
  ) {
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
        <h2>
          Interview data not found.
        </h2>

        <button
          onClick={() =>
            navigate(
              "/interview-setup"
            )
          }
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

  // ==========================================
  // AI ANSWER EVALUATION
  // ==========================================
  // Final answers Gemini ko bheje jayenge.
  // Har answer ko 0-10 score milega.
  // ==========================================

  const evaluateAnswers = async (
    updatedAnswers
  ) => {
    try {
      console.log(
        "================================="
      );

      console.log(
        "Starting Gemini AI Answer Evaluation..."
      );

      console.log(
        "Questions:",
        questions
      );

      console.log(
        "Answers:",
        updatedAnswers
      );

      console.log(
        "================================="
      );

      // Gemini evaluation API call
      const response =
        await fetch(
          "http://localhost:5000/api/evaluate-interview-answers",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              questions:
                questions,

              answers:
                updatedAnswers
            })
          }
        );

      // Backend response JSON
      const data =
        await response.json();

      // Backend error check
      if (!response.ok) {
        console.error(
          "AI Evaluation Error:",
          data
        );

        alert(
          data.message ||
            "Failed to evaluate interview answers."
        );

        return null;
      }

      // Success response
      if (!data.success) {
        console.error(
          "AI Evaluation Failed:",
          data
        );

        alert(
          data.message ||
            "AI evaluation failed."
        );

        return null;
      }

      console.log(
        "================================="
      );

      console.log(
        "Gemini AI Evaluation Completed."
      );

      console.log(
        "Evaluations:",
        data.evaluations
      );

      console.log(
        "Total AI Score:",
        data.totalScore
      );

      console.log(
        "Maximum AI Score:",
        data.maxScore
      );

      console.log(
        "================================="
      );

      return data;
    } catch (error) {
      // Network/server error
      console.error(
        "AI Evaluation Request Error:",
        error
      );

      alert(
        "Unable to evaluate answers. Please make sure the backend server is running."
      );

      return null;
    }
  };

  // ==========================================
  // FINISH INTERVIEW
  // ==========================================

  const finishInterview = async (
    updatedAnswers
  ) => {
    // Logged-in user check
    if (!userId) {
      alert(
        "Please login before starting an interview."
      );

      navigate("/login");

      return;
    }

    // Saving/evaluation process start
    setSaving(true);

    // Stop question voice
    window.speechSynthesis.cancel();

    // Stop interviewer video
    const video =
      document.getElementById(
        "interviewer-video"
      );

    if (video) {
      video.pause();

      video.currentTime = 0;
    }

    // Stop microphone if active
    if (
      recognition &&
      isListening
    ) {
      recognition.stop();

      setIsListening(false);
    }

    try {
      // ==========================================
      // STEP 1
      // GEMINI SE ANSWERS EVALUATE KARNA
      // ==========================================

      const evaluation =
        await evaluateAnswers(
          updatedAnswers
        );

      // Agar AI evaluation fail ho gayi
      // to interview save nahi karenge.
      if (!evaluation) {
        setSaving(false);

        return;
      }

      // ==========================================
      // STEP 2
      // AI TOTAL SCORE
      // ==========================================

      const totalAIScore =
        Number(
          evaluation.totalScore
        ) || 0;

      const maxAIScore =
        Number(
          evaluation.maxScore
        ) ||
        questions.length * 10;

      // ==========================================
      // STEP 3
      // EXISTING DATABASE SCORE FORMAT
      // ==========================================
      //
      // Existing score field question-based hai.
      //
      // Example:
      // AI score = 72 / 100
      // Existing score = 7 / 10
      //
      // Isse current Result/Profile structure
      // compatible rahega.
      // ==========================================

      const finalScore =
        Math.round(
          totalAIScore / 10
        );

      // Safety: score ko total questions
      // se zyada nahi hone dena
      const normalizedScore =
        Math.min(
          questions.length,
          Math.max(
            0,
            finalScore
          )
        );

      console.log(
        "AI Total Score:",
        totalAIScore,
        "/",
        maxAIScore
      );

      console.log(
        "Normalized Database Score:",
        normalizedScore,
        "/",
        questions.length
      );

      // ==========================================
      // STEP 4
      // DATABASE ME INTERVIEW SAVE KARNA
      // ==========================================

      const response =
        await fetch(
          "http://localhost:5000/api/interviews",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              // Logged-in user
              user_id: userId,

              // Interview configuration
              role:
                role ||
                "Resume Based Interview",

              experience:
                experience ||
                "Not Specified",

              interview_type:
                type ||
                "Resume Based",

              // AI normalized score
              score:
                normalizedScore,

              // Total questions
              total_questions:
                questions.length,

              // Questions
              questions:
                questions,

              // User answers
              answers:
                updatedAnswers,

              // AI evaluation data
              evaluations:
                evaluation.evaluations
            })
          }
        );

      // Backend JSON response
      const data =
        await response.json();

      // Database save error
      if (!response.ok) {
        console.error(
          "Backend save error:",
          data
        );

        alert(
          data.message ||
            "Failed to save interview result."
        );

        setSaving(false);

        return;
      }

      // ==========================================
      // DATABASE SAVE SUCCESS
      // ==========================================

      console.log(
        "Interview saved successfully:",
        data.interview
      );

      // ==========================================
      // RESULT PAGE
      // AI EVALUATION RESULT KE SAATH
      // ==========================================

      navigate("/result", {
        state: {
          // Existing Result.jsx ke liye
          score:
            normalizedScore,

          // User answers
          answers:
            updatedAnswers,

          // Questions
          questions:
            questions,

          // New AI evaluation data
          evaluations:
            evaluation.evaluations,

          // Complete AI score
          totalAIScore:
            totalAIScore,

          // Maximum AI score
          maxAIScore:
            maxAIScore
        }
      });
    } catch (error) {
      // ==========================================
      // FINAL ERROR HANDLING
      // ==========================================

      console.error(
        "Error finishing interview:",
        error
      );

      alert(
        "Unable to complete interview. Please make sure the backend server is running."
      );

      setSaving(false);
    }
  };

  // ==========================================
  // SUBMIT ANSWER
  // ==========================================

  const handleSubmitAnswer =
    async () => {
      // Empty answer prevent karna
      if (
        answer.trim() === ""
      ) {
        alert(
          "Please enter your answer before submitting."
        );

        return;
      }

      // Question voice stop
      window.speechSynthesis.cancel();

      // Current question ke exact index par
      // answer save karo.
      //
      // Isse 5, 10, 15, 20, 25 ya 30
      // kisi bhi question count par
      // questions aur answers ka count
      // hamesha equal rahega.
      const updatedAnswers =
        Array.from(
          {
            length:
              questions.length
          },
          (_, index) =>
            answers[index] || ""
        );

      updatedAnswers[
        questionNumber - 1
      ] = answer.trim();

      // Answers state update
      setAnswers(
        updatedAnswers
      );

      // Textarea clear
      setAnswer("");

      // More questions remaining
      if (
        questionNumber <
        questions.length
      ) {
        setQuestionNumber(
          questionNumber + 1
        );

        return;
      }

      // Final question
      await finishInterview(
        updatedAnswers
      );
    };

  // ==========================================
  // SKIP CURRENT QUESTION
  // ==========================================

  const handleSkipQuestion =
    async () => {
      // Skip confirmation
      const confirmSkip =
        window.confirm(
          "Are you sure you want to skip this question?"
        );

      // Cancel
      if (!confirmSkip) {
        return;
      }

      // Question voice stop
      window.speechSynthesis.cancel();

      // Empty answer = skipped.
      // Current question ke exact index par
      // empty string save karna hai.
      const updatedAnswers =
        Array.from(
          {
            length:
              questions.length
          },
          (_, index) =>
            answers[index] || ""
        );

      updatedAnswers[
        questionNumber - 1
      ] = "";

      // Answers state update
      setAnswers(
        updatedAnswers
      );

      // Textarea clear
      setAnswer("");

      // More questions remaining
      if (
        questionNumber <
        questions.length
      ) {
        setQuestionNumber(
          questionNumber + 1
        );

        return;
      }

      // Final question skipped
      await finishInterview(
        updatedAnswers
      );
    };

  
  // ==========================================
  // FUTURISTIC AI INTERVIEW ROOM UI
  // ==========================================

  return (
    <div className="interview-page">
      {/* Decorative background glows */}
      <div className="interview-glow interview-glow-one" />
      <div className="interview-glow interview-glow-two" />

      <main className="interview-shell">
        {/* Top header */}
        <header className="interview-topbar">
          <div className="interview-brand">
            <div className="interview-brand-icon">✦</div>
            <div>
              <strong>AI INTERVIEW</strong>
              <span>INTERVIEW STUDIO</span>
            </div>
          </div>

          <div className="interview-live-status">
            <span className="interview-live-dot" />
            SESSION ACTIVE
          </div>
        </header>

        {/* Interview title */}
        <section className="interview-heading">
          <div className="interview-heading-label">
            <span>✧</span> YOUR AI-POWERED SESSION
          </div>

          <h1>
            AI Mock <span>Interview</span>
          </h1>

          <p>
            Stay focused, express your thoughts, and showcase your skills.
          </p>
        </section>

        {/* Interview configuration */}
        <section className="interview-config">
          <div className="interview-config-item">
            <span className="interview-config-icon">💼</span>
            <div>
              <span className="interview-config-label">ROLE</span>
              <strong>{role || "Resume Based"}</strong>
            </div>
          </div>

          <div className="interview-config-item">
            <span className="interview-config-icon">📈</span>
            <div>
              <span className="interview-config-label">EXPERIENCE</span>
              <strong>{experience || "Not specified"}</strong>
            </div>
          </div>

          <div className="interview-config-item">
            <span className="interview-config-icon">🎯</span>
            <div>
              <span className="interview-config-label">INTERVIEW TYPE</span>
              <strong>{type || "Resume Based"}</strong>
            </div>
          </div>

          <div className="interview-config-item">
            <span className="interview-config-icon">❓</span>
            <div>
              <span className="interview-config-label">TOTAL QUESTIONS</span>
              <strong>{questions.length}</strong>
            </div>
          </div>
        </section>

        {/* Question progress */}
        <section className="interview-progress-panel">
          <div className="interview-progress-top">
            <div>
              <span className="interview-progress-caption">
                INTERVIEW PROGRESS
              </span>
              <h2>
                Question <span>{questionNumber}</span>
                <span className="interview-progress-total">
                  {" "}/ {questions.length}
                </span>
              </h2>
            </div>

            <div className="interview-progress-percent">
              {Math.round(
                (questionNumber / questions.length) * 100
              )}%
            </div>
          </div>

          <div
            className="interview-progress-track"
            role="progressbar"
            aria-label="Interview progress"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={questionNumber}
          >
            <div
              className="interview-progress-fill"
              style={{
                width: `${
                  (questionNumber / questions.length) * 100
                }%`
              }}
            />
          </div>
        </section>

        {/* Main interview workspace */}
        <div className="interview-workspace">
          {/* AI interviewer panel */}
          <section className="interview-panel interviewer-panel">
            <div className="interview-panel-heading">
              <div>
                <span className="interview-panel-eyebrow">
                  YOUR INTERVIEWER
                </span>
                <h2>AI Interviewer</h2>
              </div>

              <span className="interviewer-online">
                <span className="interview-live-dot" />
                Online
              </span>
            </div>

            {/* Keep the original video ID and source */}
            <div className="interviewer-video-frame">
              <div className="interviewer-video-glow" />

              <video
                id="interviewer-video"
                key={questionNumber}
                src="/interviewer/interviewer.mp4"
                autoPlay
                loop
                playsInline
                className="interviewer-video"
              />

              <div className="interviewer-video-caption">
                <span className="interviewer-caption-dot" />
                AI INTERVIEWER
              </div>
            </div>

            {/* Replay and pause/resume controls */}
            <div className="interviewer-controls">
              <button
                type="button"
                className="interview-secondary-btn"
                onClick={handleReplayQuestion}
                disabled={saving}
              >
                <span>↻</span>
                Replay Question
              </button>

              <button
                type="button"
                className={
                  isPaused
                    ? "interview-secondary-btn interview-resume-btn"
                    : "interview-secondary-btn"
                }
                onClick={handlePauseResume}
                disabled={saving}
              >
                <span>{isPaused ? "▶" : "Ⅱ"}</span>
                {isPaused ? "Resume" : "Pause"}
              </button>
            </div>

            <div className="interviewer-tip">
              <span>✦</span>
              Listen carefully before answering the question.
            </div>
          </section>

          {/* Question and answer panel */}
          <section className="interview-panel answer-panel">
            <div className="interview-panel-heading">
              <div>
                <span className="interview-panel-eyebrow">
                  QUESTION {questionNumber}
                </span>
                <h2>It's your turn</h2>
              </div>

              <div className="question-number-badge">
                {String(questionNumber).padStart(2, "0")}
              </div>
            </div>

            {/* Current question */}
            <div className="interview-question-card">
              <div className="interview-question-icon">Q</div>

              <h3>{currentQuestion}</h3>
            </div>

            {/* Answer editor header */}
            <div className="answer-editor-heading">
              <label htmlFor="interview-answer">
                Your Answer
              </label>

              <span>
                {answer.trim()
                  ? `${answer.trim().split(/\s+/).length} words`
                  : "Type or speak"}
              </span>
            </div>

            {/* Answer text input */}
            <textarea
              id="interview-answer"
              className="interview-answer-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Start typing your answer here. Explain your approach clearly..."
              rows={8}
              disabled={saving}
            />

            {/* Voice answer controls */}
            <div className="interview-voice-row">
              <div className="interview-voice-description">
                <span className="interview-mic-icon">🎙</span>
                <div>
                  <strong>
                    {isListening ? "Listening to you..." : "Voice Answer"}
                  </strong>
                  <span>
                    {isListening
                      ? "Speak clearly into your microphone"
                      : "Use your microphone to answer"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={
                  isListening
                    ? "interview-mic-btn interview-mic-active"
                    : "interview-mic-btn"
                }
                onClick={handleVoiceAnswer}
                disabled={saving}
              >
                {isListening ? "■ Stop" : "🎤 Speak"}
              </button>
            </div>

            {/* Submit and skip actions */}
            <div className="interview-answer-actions">
              <button
                type="button"
                className="interview-skip-btn"
                onClick={handleSkipQuestion}
                disabled={saving}
              >
                Skip Question <span>→</span>
              </button>

              <button
                type="button"
                className="interview-submit-btn"
                onClick={handleSubmitAnswer}
                disabled={saving}
              >
                {saving
                  ? "Evaluating with AI..."
                  : questionNumber === questions.length
                  ? "Finish Interview"
                  : "Submit Answer"}

                {!saving && <span>→</span>}
              </button>
            </div>

            <p className="interview-privacy-note">
              <span>🔒</span>
              Your answers are evaluated by AI when you finish.
            </p>
          </section>
        </div>

        {/* Bottom session note */}
        <footer className="interview-bottom-note">
          <span>✦</span>
          Take your time. Clear, structured answers make a difference.
        </footer>
      </main>
    </div>
  );
}

export default Interview;