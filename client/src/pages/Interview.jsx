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
  // INTERVIEW UI
  // ==========================================

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
          border:
            "1px solid #3730a3",
          boxShadow:
            "0 20px 40px rgba(0, 0, 0, 0.25)"
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
          Answer the questions to
          complete your interview.
        </p>

        {/* Interview configuration */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
            border:
              "1px solid #334155"
          }}
        >
          <p
            style={{
              margin: "0 0 10px"
            }}
          >
            <strong>Role:</strong>{" "}
            {role}
          </p>

          <p
            style={{
              margin: "0 0 10px"
            }}
          >
            <strong>
              Experience:
            </strong>{" "}
            {experience}
          </p>

          <p
            style={{
              margin: "0 0 10px"
            }}
          >
            <strong>
              Interview Type:
            </strong>{" "}
            {type}
          </p>

          <p
            style={{
              margin: 0
            }}
          >
            <strong>
              Total Questions:
            </strong>{" "}
            {questions.length}
          </p>
        </div>

        {/* Interview progress */}
        <div
          style={{
            marginBottom: "20px"
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#cbd5e1"
            }}
          >
            Question{" "}
            {questionNumber} of{" "}
            {questions.length}
          </p>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor:
                "#334155",
              borderRadius: "10px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${
                  (questionNumber /
                    questions.length) *
                  100
                }%`,
                height: "100%",
                backgroundColor:
                  "#6366f1",
                borderRadius: "10px"
              }}
            ></div>
          </div>
        </div>

        {/* ==========================================
            AI INTERVIEWER VIDEO
            ========================================== */}

        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            backgroundColor:
              "#020617",
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "20px",
            border:
              "1px solid #334155"
          }}
        >
          <video
            id="interviewer-video"
            key={questionNumber}
            src="/interviewer/interviewer.mp4"
            autoPlay
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block"
            }}
          />
        </div>

        {/* ==========================================
            REPLAY + PAUSE / RESUME BUTTONS
            ========================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap"
          }}
        >
          {/* Replay button */}
          <button
            type="button"
            onClick={
              handleReplayQuestion
            }
            disabled={saving}
            style={{
              padding:
                "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor:
                saving
                  ? "#64748b"
                  : "#4f46e5",
              color: "#ffffff",
              cursor: saving
                ? "not-allowed"
                : "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            ▶ Replay Question
          </button>

          {/* Pause / Resume button */}
          <button
            type="button"
            onClick={
              handlePauseResume
            }
            disabled={saving}
            style={{
              padding:
                "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor:
                saving
                  ? "#64748b"
                  : isPaused
                  ? "#16a34a"
                  : "#f59e0b",
              color: "#ffffff",
              cursor: saving
                ? "not-allowed"
                : "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            {isPaused
              ? "▶ Resume Interview"
              : "⏸ Pause Interview"}
          </button>
        </div>

        {/* Current interview question */}
        <div
          style={{
            backgroundColor:
              "#0f172a",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "20px",
            border:
              "1px solid #334155"
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#a5b4fc",
              fontSize: "14px",
              fontWeight: "600",
              textTransform:
                "uppercase"
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
            {
              questions[
                questionNumber - 1
              ]
            }
          </h2>
        </div>

        {/* ==========================================
            VOICE ANSWER BUTTON
            ========================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            marginBottom: "10px"
          }}
        >
          <button
            type="button"
            onClick={
              handleVoiceAnswer
            }
            disabled={saving}
            style={{
              padding:
                "10px 18px",
              backgroundColor:
                isListening
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
          onChange={(e) =>
            setAnswer(
              e.target.value
            )
          }
          placeholder="Type your answer here..."
          rows="8"
          disabled={saving}
          style={{
            width: "100%",
            boxSizing:
              "border-box",
            padding: "15px",
            backgroundColor:
              "#0f172a",
            color: "#ffffff",
            border:
              "1px solid #475569",
            borderRadius: "10px",
            resize: "vertical",
            fontSize: "16px",
            outline: "none",
            marginBottom: "20px",
            opacity: saving
              ? 0.6
              : 1
          }}
        />

        {/* Submit and Skip buttons */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: "12px"
          }}
        >
          {/* Skip button */}
          <button
            onClick={
              handleSkipQuestion
            }
            disabled={saving}
            style={{
              padding:
                "12px 24px",
              backgroundColor:
                saving
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

          {/* Submit / Finish button */}
          <button
            onClick={
              handleSubmitAnswer
            }
            disabled={saving}
            style={{
              padding:
                "12px 24px",
              backgroundColor:
                saving
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
              ? "Evaluating with AI..."
              : questionNumber ===
                questions.length
              ? "Finish Interview"
              : "Submit Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Interview;