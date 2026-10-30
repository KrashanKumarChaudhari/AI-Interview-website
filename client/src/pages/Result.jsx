
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check whether the user is logged in.
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  // Prevent logged-out users from viewing results.
  if (!userId) return null;

  // Read interview results passed by Interview.jsx.
  const {
    score,
    answers,
    questions,
    evaluations,
    totalAIScore,
    maxAIScore,
  } = location.state || {};

  const totalQuestions = questions?.length || 0;

  const answeredQuestions =
    answers?.filter((answer) => answer.trim() !== "").length || 0;

  // Prefer the detailed AI score when available.
  const hasAIScore =
    typeof totalAIScore === "number" &&
    typeof maxAIScore === "number" &&
    maxAIScore > 0;

  const percentage = hasAIScore
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round((totalAIScore / maxAIScore) * 100)
        )
      )
    : totalQuestions
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(((score || 0) / totalQuestions) * 100)
          )
        )
      : 0;

  // Determine the performance category.
  let performanceLevel = "Needs Improvement";

  if (percentage >= 80) performanceLevel = "Excellent";
  else if (percentage >= 60) performanceLevel = "Good";
  else if (percentage >= 40) performanceLevel = "Average";

  // Generate overall feedback.
  let feedback =
    "Keep practicing and work on improving your interview answers.";

  if (percentage >= 80) {
    feedback =
      "Excellent performance! Your answers show strong understanding.";
  } else if (percentage >= 60) {
    feedback =
      "Good performance! Keep practicing to improve further.";
  } else if (percentage >= 40) {
    feedback =
      "Average performance. Focus on accuracy and completeness in your answers.";
  }

  // Safely retrieve individual AI evaluation details.
  const getAIScore = (index) =>
    evaluations?.[index]?.score ?? null;

  const getAIFeedback = (index) =>
    evaluations?.[index]?.feedback ?? null;

  // Generate and download the interview report as a PDF.
  const downloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = 18;
      const contentWidth = pageWidth - margin * 2;

      let y = 20;

      // Add a new page when content exceeds the available space.
      const checkPageSpace = (requiredHeight = 10) => {
        if (y + requiredHeight > pageHeight - 18) {
          doc.addPage();
          y = 20;
        }
      };

      // Add wrapped text with automatic page continuation.
      const addWrappedText = (
        text,
        fontSize = 10,
        color = [55, 65, 81],
        lineHeight = 5
      ) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(
          String(text ?? ""),
          contentWidth
        );

        lines.forEach((line) => {
          checkPageSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        });

        y += 2;
      };

      // Main PDF heading.
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 48, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(19);
      doc.text("AI MOCK INTERVIEW PREP", margin, 19);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("INTERVIEW PERFORMANCE REPORT", margin, 29);

      doc.setFontSize(9);
      doc.setTextColor(199, 210, 254);
      doc.text(
        `Generated: ${new Date().toLocaleString("en-IN")}`,
        margin,
        39
      );

      y = 60;

      // Overall score section.
      doc.setTextColor(79, 70, 229);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("PERFORMANCE OVERVIEW", margin, y);

      y += 10;

      doc.setDrawColor(220, 224, 235);
      doc.roundedRect(
        margin,
        y - 5,
        contentWidth,
        39,
        3,
        3,
        "S"
      );

      doc.setFontSize(23);
      doc.setTextColor(79, 70, 229);
      doc.text(`${percentage}%`, margin + 6, y + 9);

      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text(
        `Performance: ${performanceLevel}`,
        margin + 35,
        y + 1
      );

      doc.text(
        `Questions: ${totalQuestions}`,
        margin + 35,
        y + 9
      );

      doc.text(
        `Answered: ${answeredQuestions}/${totalQuestions}`,
        margin + 35,
        y + 17
      );

      doc.text(
        hasAIScore
          ? `Gemini AI Score: ${totalAIScore}/${maxAIScore}`
          : `Interview Score: ${score ?? 0}/${totalQuestions}`,
        margin + 35,
        y + 25
      );

      y += 44;

      // Overall feedback.
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text("Overall Feedback", margin, y);

      y += 7;
      addWrappedText(feedback, 10);

      // AI evaluation explanation.
      if (hasAIScore) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.text("AI Evaluation", margin, y);

        y += 7;

        addWrappedText(
          "Gemini AI evaluated answers based on correctness, relevance, completeness, technical understanding and clarity.",
          9
        );
      }

      // Detailed question-wise analysis.
      checkPageSpace(20);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229);
      doc.text("DETAILED QUESTION ANALYSIS", margin, y);

      y += 12;

      if (answers?.length) {
        answers.forEach((answer, index) => {
          const aiScore = getAIScore(index);
          const aiFeedback = getAIFeedback(index);
          const isSkipped = answer.trim() === "";

          // Keep question heading together with the question text.
          checkPageSpace(25);

          doc.setDrawColor(220, 224, 235);
          doc.line(margin, y - 3, pageWidth - margin, y - 3);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(79, 70, 229);

          doc.text(
            `QUESTION ${String(index + 1).padStart(2, "0")}`,
            margin,
            y + 3
          );

          if (aiScore !== null) {
            doc.setTextColor(22, 163, 74);
            doc.text(
              `AI Score: ${aiScore}/10`,
              pageWidth - margin - 35,
              y + 3
            );
          } else {
            doc.setTextColor(107, 114, 128);
            doc.text(
              isSkipped ? "Skipped" : "Submitted",
              pageWidth - margin - 35,
              y + 3
            );
          }

          y += 11;

          // Interview question.
          addWrappedText(
            questions?.[index] || "Interview question",
            10,
            [31, 41, 55],
            5
          );

          // User's answer.
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(79, 70, 229);
          checkPageSpace(8);
          doc.text("YOUR ANSWER", margin, y);

          y += 6;

          addWrappedText(
            isSkipped
              ? "Not answered - this question was skipped."
              : answer,
            9,
            [55, 65, 81],
            4.5
          );

          // Individual AI feedback.
          if (aiScore !== null) {
            checkPageSpace(12);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(79, 70, 229);
            doc.text("AI FEEDBACK", margin, y);

            y += 6;

            addWrappedText(
              aiFeedback || "No feedback available for this answer.",
              9,
              [55, 65, 81],
              4.5
            );
          }

          y += 5;
        });
      } else {
        addWrappedText("No answer details available.", 10);
      }

      // Add page numbers to every page.
      const totalPages = doc.internal.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);

        doc.setDrawColor(220, 224, 235);
        doc.line(
          margin,
          pageHeight - 13,
          pageWidth - margin,
          pageHeight - 13
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);

        doc.text(
          "AI Mock Interview Prep | Confidential Report",
          margin,
          pageHeight - 8
        );

        doc.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      // Download the generated PDF.
      doc.save("AI_Mock_Interview_Report.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Unable to generate PDF. Please try again.");
    }
  };

  return (
    <main className="result-page">
      <div className="result-shell">

        {/* Dashboard heading */}
        <header className="result-header">
          <div className="result-eyebrow">
            <span className="result-live-dot" />
            AI INTERVIEW ANALYTICS
          </div>

          <h1>
            Interview <span>Results</span>
          </h1>

          <p>
            Your performance report is ready. Review your results
            and improve your next attempt.
          </p>
        </header>

        {/* Main score dashboard */}
        <section className="result-overview">
          <div className="result-score-panel">
            <div
              className="result-score-ring"
              style={{ "--score": `${percentage}%` }}
            >
              <div className="result-score-inner">
                <strong>{percentage}%</strong>
                <span>Overall Score</span>
              </div>
            </div>

            <div className="result-performance-label">
              {performanceLevel}
            </div>

            <p className="result-summary">{feedback}</p>
          </div>

          <div className="result-stats">
            <div className="result-stat-card">
              <span className="result-stat-icon">◎</span>
              <span className="result-stat-label">Questions</span>
              <strong>{totalQuestions}</strong>
              <small>Total interview questions</small>
            </div>

            <div className="result-stat-card">
              <span className="result-stat-icon">✓</span>
              <span className="result-stat-label">Answered</span>

              <strong>
                {answeredQuestions}
                <span className="result-stat-total">
                  {" "}/ {totalQuestions}
                </span>
              </strong>

              <small>Questions attempted</small>
            </div>

            <div className="result-stat-card result-stat-wide">
              <span className="result-stat-icon">✧</span>

              <span className="result-stat-label">
                {hasAIScore ? "Gemini AI Score" : "Interview Score"}
              </span>

              <strong>
                {hasAIScore
                  ? `${totalAIScore} / ${maxAIScore}`
                  : `${score ?? 0} / ${totalQuestions}`}
              </strong>

              <div className="result-progress-track">
                <div
                  className="result-progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* AI evaluation information */}
        {hasAIScore && (
          <section className="result-ai-info">
            <div className="result-ai-icon">✧</div>

            <div>
              <h2>AI Evaluation Report</h2>
              <p>
                Gemini AI evaluated your answers for correctness,
                relevance, completeness, technical understanding
                and clarity.
              </p>
            </div>

            <span className="result-ai-badge">AI ANALYZED</span>
          </section>
        )}

        {/* Individual question and answer feedback */}
        <section className="result-answers-section">
          <div className="result-section-heading">
            <div>
              <span className="result-section-kicker">
                DETAILED ANALYSIS
              </span>

              <h2>Your Answers</h2>

              <p>
                Review your responses and AI feedback question by question.
              </p>
            </div>

            <span className="result-count-badge">
              {totalQuestions} Questions
            </span>
          </div>

          {answers?.length ? (
            answers.map((answer, index) => {
              const aiScore = getAIScore(index);
              const aiFeedback = getAIFeedback(index);
              const isSkipped = answer.trim() === "";

              return (
                <article className="result-answer-card" key={index}>
                  <div className="result-question-top">
                    <span className="result-question-number">
                      QUESTION {String(index + 1).padStart(2, "0")}
                    </span>

                    {aiScore !== null && (
                      <span
                        className={`result-answer-score ${
                          aiScore >= 7
                            ? "score-high"
                            : aiScore >= 4
                              ? "score-medium"
                              : "score-low"
                        }`}
                      >
                        AI Score: {aiScore}/10
                      </span>
                    )}

                    {aiScore === null && (
                      <span className="result-pending-badge">
                        {isSkipped ? "Skipped" : "Submitted"}
                      </span>
                    )}
                  </div>

                  <h3>
                    {questions?.[index] || "Interview question"}
                  </h3>

                  <div className="result-user-answer">
                    <span className="result-answer-label">
                      YOUR ANSWER
                    </span>

                    <p>
                      {isSkipped
                        ? "Not answered - this question was skipped."
                        : answer}
                    </p>
                  </div>

                  {aiScore !== null && (
                    <div className="result-feedback-panel">
                      <div className="result-feedback-title">
                        <span>✧</span> AI Feedback
                      </div>

                      <p>
                        {aiFeedback ||
                          "No feedback available for this answer."}
                      </p>
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <div className="result-empty-state">
              <span>◎</span>
              <h3>No answer details available</h3>
              <p>
                Complete an interview to see your detailed
                answer analysis here.
              </p>
            </div>
          )}
        </section>

        {/* Navigation and PDF download actions */}
        <footer className="result-footer">
          <p>READY FOR YOUR NEXT CHALLENGE?</p>

          <div className="result-actions">

            {/* New PDF download button */}
            <button
              className="result-btn result-btn-primary"
              onClick={downloadPDF}
            >
              ↓ Download PDF Report
            </button>

            <button
              className="result-btn result-btn-secondary"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>

            <button
              className="result-btn result-btn-primary"
              onClick={() => navigate("/interview-setup")}
            >
              Restart Interview <span>↗</span>
            </button>

          </div>
        </footer>
      </div>
    </main>
  );
}

export default Result;
