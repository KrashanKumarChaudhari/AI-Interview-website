const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const express = require("express");

// Gemini AI SDK
const { GoogleGenAI } = require("@google/genai");

const cors = require("cors");

const { Pool } = require("pg");

// Resume file upload handle karne ke liye multer
const multer = require("multer");

// PDF resume text extraction ke liye
const { PDFParse } = require("pdf-parse");

require("dotenv").config();

// ==========================================
// GEMINI AI CLIENT
// ==========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// Frontend (5173) ko backend (5000) se request karne ki permission
app.use(cors());

// JSON request body ko read karne ke liye
app.use(express.json());

// ==========================================
// RESUME UPLOAD CONFIGURATION
// ==========================================

// Resume files ko server/uploads folder me save karega
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Resume save karne ki location
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    // Original file name ko preserve karte hue
    // unique timestamp add karna
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  }
});

// Multer ko storage configuration dena
const upload = multer({
  storage: storage,

  // Maximum resume size: 5 MB
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ==========================================
// BASIC TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send(
    "AI Interview Backend is running!"
  );
});

// ==========================================
// RESUME UPLOAD + PDF TEXT EXTRACTION API
// ==========================================

app.post(
  "/api/upload-resume",
  upload.single("resume"),
  async (req, res) => {
    try {
      // Check karo ki resume upload hua ya nahi
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a resume."
        });
      }

      // File system module
      const fs = require("fs");

      // Uploaded PDF ko read karna
      const pdfBuffer = fs.readFileSync(
        req.file.path
      );

      // ==========================================
      // PDF PARSER
      // ==========================================

      const parser = new PDFParse({
        data: pdfBuffer
      });

      // PDF se text extract karna
      const pdfData = await parser.getText();

      // Extracted resume text
      const resumeText = pdfData.text;

      // ==========================================
      // DEBUG INFORMATION
      // ==========================================

      console.log(
        "================================="
      );

      console.log(
        "Resume uploaded successfully"
      );

      console.log(
        "File:",
        req.file.originalname
      );

      console.log(
        "Extracted Resume Text:"
      );

      console.log(resumeText);

      console.log(
        "================================="
      );

      // ==========================================
      // FRONTEND RESPONSE
      // ==========================================

      res.json({
        message:
          "Resume uploaded and text extracted successfully.",

        fileName:
          req.file.filename,

        originalName:
          req.file.originalname,

        filePath:
          req.file.path,

        // Extracted resume text frontend ko bhejna
        resumeText: resumeText
      });

    } catch (error) {
      // Backend terminal me complete error show karo
      console.error(
        "Resume processing error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to process resume.",

        error:
          error.message
      });
    }
  }
);

// ==========================================
// POSTGRESQL DATABASE CONNECTION
// ==========================================

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false
  }
});

// ==========================================
// DATABASE TEST ROUTE
// ==========================================

app.get("/db-test", async (req, res) => {
  try {
    const result =
      await pool.query(
        "SELECT NOW()"
      );

    res.json({
      message:
        "Database connected successfully!",

      time:
        result.rows[0].now
    });

  } catch (error) {
    console.error(
      "Database connection error:",
      error.message
    );

    res.status(500).json({
      message:
        "Database connection failed."
    });
  }
});

// ==========================================
// SIGNUP
// ==========================================

app.post("/signup", async (req, res) => {
  try {
    // Get signup information from frontend
    const {
      name,
      email,
      password
    } = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "All fields are required."
      });
    }

    // Convert password into secure hash
    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // Save new user in PostgreSQL
    const result =
      await pool.query(
        `INSERT INTO users
         (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at`,
        [
          name,
          email,
          hashedPassword
        ]
      );

    // Send created user information
    res.status(201).json({
      message:
        "Account created successfully!",

      user:
        result.rows[0]
    });

  } catch (error) {
    console.error(
      "Signup error:",
      error.message
    );

    res.status(500).json({
      message:
        "Signup failed."
    });
  }
});

// ==========================================
// LOGIN
// ==========================================

app.post("/login", async (req, res) => {
  try {
    // Get login information
    const {
      email,
      password
    } = req.body;

    // Check required fields
    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Email and password are required."
      });
    }

    // Find user by email
    const result =
      await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

    // User does not exist
    if (
      result.rows.length === 0
    ) {
      return res.status(401).json({
        message:
          "Invalid email or password."
      });
    }

    const user =
      result.rows[0];

    // Compare entered password with hash
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    // Password incorrect
    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password."
      });
    }

    // Create JWT token
    const token =
      jwt.sign(
        {
          id: user.id,
          email: user.email
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "1h"
        }
      );

    // Send token and user information
    res.json({
      message:
        "Login successful!",

      token: token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      message:
        "Login failed."
    });
  }
});

// ==========================================
// JWT TOKEN VERIFICATION
// ==========================================

function verifyToken(
  req,
  res,
  next
) {
  // Get Authorization header
  const authHeader =
    req.headers.authorization;

  // Token does not exist
  if (!authHeader) {
    return res.status(401).json({
      message:
        "Access denied. No token provided."
    });
  }

  // Extract token from:
  // Bearer TOKEN
  const token =
    authHeader.split(" ")[1];

  try {
    // Verify JWT token
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // Store decoded user information
    req.user = decoded;

    // Continue to protected route
    next();

  } catch (error) {
    return res.status(401).json({
      message:
        "Invalid or expired token."
    });
  }
}

// ==========================================
// PROTECTED PROFILE ROUTE
// ==========================================

app.get(
  "/profile",
  verifyToken,
  async (req, res) => {
    try {
      // Get logged-in user's information
      const result =
        await pool.query(
          `SELECT id, name, email
           FROM users
           WHERE id = $1`,
          [req.user.id]
        );

      // User not found
      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            "User not found."
        });
      }

      // Send profile information
      res.json({
        message:
          "Protected profile accessed successfully!",

        user:
          result.rows[0]
      });

    } catch (error) {
      console.error(
        "Profile error:",
        error.message
      );

      res.status(500).json({
        message:
          "Profile fetch failed."
      });
    }
  }
);

// ==========================================
// SAVE COMPLETE INTERVIEW RESULT
// ==========================================

app.post(
  "/api/interviews",
  async (req, res) => {
    try {
      // Get complete interview data
      const {
  user_id,
  role,
  experience,
  interview_type,
  score,
  total_questions,
  questions,
  answers,
  evaluations
} = req.body;

      // ==========================================
      // VALIDATE INTERVIEW DATA
      // ==========================================

      if (
        !user_id ||
        !role ||
        !experience ||
        !interview_type ||
        score === undefined ||
        total_questions === undefined
      ) {
        return res.status(400).json({
          message:
            "Required interview data is missing."
        });
      }

      // ==========================================
      // VALIDATE QUESTIONS AND ANSWERS
      // ==========================================

      if (
        !Array.isArray(questions) ||
        !Array.isArray(answers)
      ) {
        return res.status(400).json({
          message:
            "Questions and answers must be arrays."
        });
      }

      // ==========================================
      // DEBUG INFORMATION
      // ==========================================

      console.log(
        "================================="
      );

      console.log(
        "Saving Interview Result"
      );

      console.log(
        "User ID:",
        user_id
      );

      console.log(
        "Role:",
        role
      );

      console.log(
        "Experience:",
        experience
      );

      console.log(
        "Interview Type:",
        interview_type
      );

      console.log(
        "Score:",
        score
      );

      console.log(
        "Total Questions:",
        total_questions
      );

      console.log(
        "Questions:",
        questions
      );

      console.log(
        "Answers:",
        answers
      );

      console.log(
        "================================="
      );

      // ==========================================
      // INSERT INTERVIEW INTO DATABASE
      // ==========================================

     const result =
  await pool.query(
    `INSERT INTO interviews
     (
       user_id,
       role,
       experience,
       interview_type,
       score,
       total_questions,
       questions,
       answers,
       evaluations
     )
     VALUES
     (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6,
       $7,
       $8,
       $9
     )
     RETURNING *`,

    [
      user_id,
      role,
      experience,
      interview_type,
      score,
      total_questions,

      // Convert arrays into JSON strings
      JSON.stringify(questions),
      JSON.stringify(answers),

      // Gemini AI evaluations ko JSON ke form me save karna
      JSON.stringify(evaluations)
    ]
  );

      // ==========================================
      // DATABASE SAVE CONFIRMATION
      // ==========================================

      console.log(
        "Interview saved successfully. Database ID:",
        result.rows[0].id
      );

      // Send saved interview to frontend
      res.status(201).json({
        message:
          "Interview result saved successfully",

        interview:
          result.rows[0]
      });

    } catch (error) {
      // Show complete database error
      console.error(
        "Error saving interview result:",
        error
      );

      res.status(500).json({
        message:
          "Failed to save interview result",

        error:
          error.message
      });
    }
  }
);

// ==========================================
// GET INTERVIEW PERFORMANCE STATISTICS
// ==========================================

app.get(
  "/api/interviews/stats/:userId",
  async (req, res) => {
    try {
      // Get user ID from URL
      const {
        userId
      } = req.params;

      // Validate user ID
      if (
        !userId ||
        isNaN(Number(userId))
      ) {
        return res.status(400).json({
          message:
            "Invalid user ID."
        });
      }

      // Calculate interview statistics
      const result =
        await pool.query(
          `SELECT
             COUNT(*) AS total_interviews,
             COALESCE(
               ROUND(AVG(score), 2),
               0
             ) AS average_score,
             COALESCE(
               MAX(score),
               0
             ) AS best_score,
             COALESCE(
               SUM(total_questions),
               0
             ) AS total_questions
           FROM interviews
           WHERE user_id = $1`,

          [Number(userId)]
        );

      // Send statistics
      res.json({
        total_interviews:
          Number(
            result.rows[0]
              .total_interviews
          ),

        average_score:
          Number(
            result.rows[0]
              .average_score
          ),

        best_score:
          Number(
            result.rows[0]
              .best_score
          ),

        total_questions:
          Number(
            result.rows[0]
              .total_questions
          )
      });

    } catch (error) {
      console.error(
        "Error fetching interview statistics:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch interview statistics."
      });
    }
  }
);

// ==========================================
// GET USER INTERVIEW HISTORY
// ==========================================

app.get(
  "/api/interviews/:userId",
  async (req, res) => {
    try {
      // Get user ID from URL
      const {
        userId
      } = req.params;

      // Validate user ID
      if (
        !userId ||
        isNaN(Number(userId))
      ) {
        return res.status(400).json({
          message:
            "Invalid user ID."
        });
      }

      // ==========================================
      // FETCH USER INTERVIEWS
      // ==========================================
      //
      // Same role ke interviews ko
      // separate attempts me count karega.
      //
      // Oldest = Attempt 1
      // Newest = highest attempt number
      // ==========================================

      const result =
        await pool.query(
          `SELECT
             *,
             ROW_NUMBER() OVER (
               PARTITION BY user_id, role
               ORDER BY created_at ASC, id ASC
             ) AS attempt_number
           FROM interviews
           WHERE user_id = $1
           ORDER BY created_at DESC, id DESC`,

          [Number(userId)]
        );

      // Send interview history
      res.json(
        result.rows
      );

    } catch (error) {
      console.error(
        "Error fetching interview history:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch interview history"
      });
    }
  }
);

// ==========================================
// GET SINGLE INTERVIEW DETAILS
// Only logged-in user's interview can be viewed
// ==========================================

app.get(
  "/api/interviews/details/:id",
  verifyToken,
  async (req, res) => {
    try {
      // Get interview ID
      const {
        id
      } = req.params;

      // Get logged-in user ID
      const userId =
        req.user.id;

      // Validate interview ID
      if (
        !id ||
        isNaN(Number(id))
      ) {
        return res.status(400).json({
          message:
            "Invalid interview ID."
        });
      }

      // Find interview belonging to logged-in user
      const result =
        await pool.query(
          `SELECT *
           FROM interviews
           WHERE id = $1
           AND user_id = $2`,

          [
            Number(id),
            userId
          ]
        );

      // Interview not found
      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            "Interview not found."
        });
      }

      // Send complete interview details
      res.json(
        result.rows[0]
      );

    } catch (error) {
      console.error(
        "Error fetching interview details:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch interview details."
      });
    }
  }
);

// ==========================================
// GEMINI API CONNECTION TEST
// ==========================================

app.get(
  "/api/test-gemini",
  async (req, res) => {
    try {
      // Gemini se simple response mangna
      const response =
        await ai.models.generateContent({
          model:
            "gemini-3.5-flash",

          contents:
            "Say hello in one short sentence."
        });

      // Gemini response browser ko bhejna
      res.json({
        success: true,

        message:
          response.text
      });

    } catch (error) {
      console.error(
        "Gemini API Error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Gemini API connection failed.",

        error:
          error.message
      });
    }
  }
);

// ==========================================
// GEMINI INTERVIEW QUESTION GENERATION API
// ==========================================
//
// Resume + Role + Experience + Interview Type
// + Question Count ke basis par Gemini
// personalized interview questions generate karega.
// ==========================================

app.post(
  "/api/generate-interview-questions",
  async (req, res) => {
    try {
      // ==========================================
      // FRONTEND DATA RECEIVE KARNA
      // ==========================================

      const {
        resumeText,
        role,
        experience,
        type,
        questionCount
      } = req.body;

      // Question count ko number me convert karna
      const count =
        Number(questionCount) || 10;

      // ==========================================
      // GEMINI PROMPT
      // ==========================================

      const prompt = `
You are an expert technical and HR interviewer.

Generate exactly ${count} interview questions.

INTERVIEW INFORMATION

Role:
${role || "Not provided"}

Experience Level:
${experience || "Not provided"}

Interview Type:
${type || "Not provided"}

Resume:
${resumeText || "No resume provided"}

IMPORTANT INSTRUCTIONS:

1. If a resume is provided, carefully analyze it.

2. Ask questions based on the candidate's actual:
   - skills
   - projects
   - internship
   - education
   - technologies
   - certifications

3. Never invent experience, projects, skills,
   technologies or achievements that are not
   present in the resume.

4. If Role is provided, make questions relevant
   to that role.

5. If Experience Level is provided, match the
   difficulty with that experience level.

6. Beginner:
   Focus on fundamentals, basic concepts
   and simple practical questions.

7. Intermediate:
   Focus on practical implementation,
   projects and problem solving.

8. Advanced:
   Focus on scenarios, architecture,
   deeper concepts and complex problem solving.

9. Technical interview:
   Questions should mainly be technical.

10. HR interview:
    Questions should mainly be behavioral,
    communication and HR related.

11. Mixed interview:
    Include a balanced combination of
    technical, project and HR questions.

12. If only a resume is provided and Role,
    Experience and Interview Type are not provided,
    generate questions primarily from the resume.

13. If no resume is provided, generate questions
    from the selected Role, Experience and
    Interview Type.

14. Every question must be different.

15. Do not repeat questions.

16. Questions should sound natural like a
    real interviewer asking a candidate.

17. Do not ask questions about information
    that does not exist in the provided resume.

18. Return ONLY a JSON array of strings.

19. Do not return markdown.

20. Do not add numbering.

EXAMPLE:

[
  "Tell me about yourself.",
  "What web development technologies have you worked with?",
  "Explain one project you have worked on."
]
`;

      // ==========================================
      // DEBUG INFORMATION
      // ==========================================

      console.log(
        "================================="
      );

      console.log(
        "Gemini interview question generation started."
      );

      console.log(
        "Role:",
        role || "Not provided"
      );

      console.log(
        "Experience:",
        experience || "Not provided"
      );

      console.log(
        "Interview Type:",
        type || "Not provided"
      );

      console.log(
        "Question Count:",
        count
      );

      console.log(
        "Resume Provided:",
        resumeText
          ? "Yes"
          : "No"
      );

      console.log(
        "================================="
      );

      // ==========================================
      // CALL GEMINI
      // ==========================================

      const response =
        await ai.models.generateContent({
          // Working Gemini model
          model:
            "gemini-3.5-flash",

          contents:
            prompt,

          config: {
            // Gemini se JSON response request karna
            responseMimeType:
              "application/json"
          }
        });

      // Gemini response text
      const responseText =
        response.text;

      // ==========================================
      // SHOW GEMINI RESPONSE
      // ==========================================

      console.log(
        "Gemini Raw Response:"
      );

      console.log(
        responseText
      );

      // ==========================================
      // CONVERT JSON STRING TO ARRAY
      // ==========================================

      const questions =
        JSON.parse(
          responseText
        );

      // ==========================================
      // SAFETY CHECK
      // ==========================================

      if (
        !Array.isArray(
          questions
        )
      ) {
        throw new Error(
          "Gemini did not return a question array."
        );
      }

      // Empty array check
      if (
        questions.length === 0
      ) {
        throw new Error(
          "Gemini returned an empty question list."
        );
      }

      // ==========================================
      // CLEAN QUESTIONS
      // ==========================================

      const cleanQuestions =
        questions
          .filter(
            (question) =>
              typeof question ===
                "string" &&
              question.trim() !== ""
          )
          .slice(0, count);

      // Final safety check
      if (
        cleanQuestions.length === 0
      ) {
        throw new Error(
          "No valid interview questions were generated."
        );
      }

      // ==========================================
      // SEND QUESTIONS TO FRONTEND
      // ==========================================

      console.log(
        "Gemini generated",
        cleanQuestions.length,
        "valid questions."
      );

      res.json({
        success: true,

        questions:
          cleanQuestions
      });

    } catch (error) {
      // ==========================================
      // GEMINI ERROR
      // ==========================================

      console.error(
        "Gemini Interview Question Error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Failed to generate interview questions.",

        error:
          error.message
      });
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

// ==========================================
// GEMINI AI ANSWER EVALUATION API
// ==========================================
// User ke interview answers ko Gemini evaluate karega.
// Har answer ko 0-10 score aur short feedback milega.
// ==========================================

app.post(
  "/api/evaluate-interview-answers",
  async (req, res) => {
    try {
      // Frontend se questions aur answers receive karna
      const {
        questions,
        answers
      } = req.body;

      // ==========================================
      // BASIC VALIDATION
      // ==========================================

      if (
        !Array.isArray(questions) ||
        !Array.isArray(answers)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Questions and answers must be arrays."
        });
      }

      // Questions aur answers ki count same honi chahiye
      if (
        questions.length !== answers.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Questions and answers count must be equal."
        });
      }

      // ==========================================
      // GEMINI EVALUATION PROMPT
      // ==========================================

      const prompt = `
You are an expert technical interview evaluator.

Evaluate the candidate's answers to the interview questions.

For every question, evaluate the answer based on:

1. Correctness
2. Relevance
3. Completeness
4. Technical understanding
5. Clarity

SCORING SYSTEM:

0 = No answer, skipped, meaningless text, or completely incorrect

1-2 = Very poor answer

3-4 = Weak answer with major problems

5-6 = Average answer with basic understanding

7-8 = Good answer with correct understanding

9 = Very good answer with strong understanding

10 = Excellent answer with accurate, complete and clear understanding

IMPORTANT RULES:

- If the answer is empty, give score 0.
- If the answer is random or meaningless text, give score 0.
- Do NOT give marks simply because an answer exists.
- Evaluate the answer according to the actual question.
- Do not invent information that is not present in the candidate's answer.
- Be fair to beginner candidates.
- A short but correct answer can still receive a good score.
- Give a short and useful feedback for every answer.
- Return exactly one evaluation for every question.
- The question number must match the question position.

INTERVIEW QUESTIONS AND CANDIDATE ANSWERS:

${questions
  .map(
    (question, index) => `
Question ${index + 1}:
${question}

Candidate Answer:
${
  answers[index] &&
  answers[index].trim() !== ""
    ? answers[index]
    : "(No answer - skipped)"
}
`
  )
  .join("\n")}

RETURN ONLY THIS JSON FORMAT:

[
  {
    "questionNumber": 1,
    "score": 0,
    "feedback": "Short feedback about the candidate's answer."
  }
]

IMPORTANT:

- Return one object for every question.
- Do not return markdown.
- Do not return explanations outside the JSON.
- Do not use percentage values.
- Score must be an integer from 0 to 10.
`;

      // ==========================================
      // DEBUG INFORMATION
      // ==========================================

      console.log(
        "================================="
      );

      console.log(
        "Gemini AI Answer Evaluation Started."
      );

      console.log(
        "Total Questions:",
        questions.length
      );

      console.log(
        "================================="
      );

      // ==========================================
      // CALL GEMINI
      // ==========================================

      const response =
        await ai.models.generateContent({
          model:
            "gemini-3.5-flash",

          contents:
            prompt,

          config: {
            responseMimeType:
              "application/json"
          }
        });

      // Gemini ka raw response
      const responseText =
        response.text;

      // ==========================================
      // SHOW GEMINI RESPONSE
      // ==========================================

      console.log(
        "Gemini Evaluation Response:"
      );

      console.log(
        responseText
      );

      // ==========================================
      // CONVERT GEMINI JSON
      // ==========================================

      const evaluations =
        JSON.parse(
          responseText
        );

      // ==========================================
      // VALIDATE GEMINI RESPONSE
      // ==========================================

      if (
        !Array.isArray(
          evaluations
        )
      ) {
        throw new Error(
          "Gemini did not return an evaluation array."
        );
      }

      // Gemini ko har question ke liye
      // evaluation return karni chahiye
      if (
        evaluations.length !==
        questions.length
      ) {
        throw new Error(
          "Gemini evaluation count does not match question count."
        );
      }

      // ==========================================
      // CLEAN EVALUATION DATA
      // ==========================================

      const cleanEvaluations =
        evaluations.map(
          (evaluation, index) => {
            let score =
              Number(
                evaluation.score
              );

            // Invalid score ko 0 karna
            if (
              Number.isNaN(score)
            ) {
              score = 0;
            }

            // Score ko 0-10 ke range me rakhna
            score = Math.round(
              Math.max(
                0,
                Math.min(
                  10,
                  score
                )
              )
            );

            // Empty answer ke liye
            // score hamesha 0 hona chahiye
            if (
              !answers[index] ||
              answers[index].trim() === ""
            ) {
              score = 0;
            }

            return {
              questionNumber:
                index + 1,

              score:
                score,

              feedback:
                typeof evaluation.feedback ===
                "string"
                  ? evaluation.feedback
                  : "No feedback available."
            };
          }
        );

      // ==========================================
      // CALCULATE TOTAL AI SCORE
      // ==========================================

      const totalScore =
        cleanEvaluations.reduce(
          (
            total,
            evaluation
          ) =>
            total +
            evaluation.score,
          0
        );

      const maxScore =
        questions.length * 10;

      // ==========================================
      // DEBUG FINAL EVALUATION
      // ==========================================

      console.log(
        "AI Evaluation Completed."
      );

      console.log(
        "Total AI Score:",
        totalScore,
        "/",
        maxScore
      );

      console.log(
        "Evaluations:",
        cleanEvaluations
      );

      // ==========================================
      // SEND RESULT TO FRONTEND
      // ==========================================

      res.json({
        success: true,

        evaluations:
          cleanEvaluations,

        totalScore:
          totalScore,

        maxScore:
          maxScore
      });

    } catch (error) {
      // ==========================================
      // GEMINI EVALUATION ERROR
      // ==========================================

      console.error(
        "Gemini Answer Evaluation Error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Failed to evaluate interview answers.",

        error:
          error.message
      });
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

// ==========================================
// GEMINI AI ANSWER EVALUATION API
// ==========================================
// User ke interview answers ko Gemini evaluate karega.
// Har answer ko 0-10 score aur short feedback milega.
// ==========================================

app.post(
  "/api/evaluate-interview-answers",
  async (req, res) => {
    try {
      // Frontend se questions aur answers receive karna
      const {
        questions,
        answers
      } = req.body;

      // ==========================================
      // BASIC VALIDATION
      // ==========================================

      if (
        !Array.isArray(questions) ||
        !Array.isArray(answers)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Questions and answers must be arrays."
        });
      }

      // Questions aur answers ki count same honi chahiye
      if (
        questions.length !== answers.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Questions and answers count must be equal."
        });
      }

      // ==========================================
      // GEMINI EVALUATION PROMPT
      // ==========================================

      const prompt = `
You are an expert technical interview evaluator.

Evaluate the candidate's answers to the interview questions.

For every question, evaluate the answer based on:

1. Correctness
2. Relevance
3. Completeness
4. Technical understanding
5. Clarity

SCORING SYSTEM:

0 = No answer, skipped, meaningless text, or completely incorrect

1-2 = Very poor answer

3-4 = Weak answer with major problems

5-6 = Average answer with basic understanding

7-8 = Good answer with correct understanding

9 = Very good answer with strong understanding

10 = Excellent answer with accurate, complete and clear understanding

IMPORTANT RULES:

- If the answer is empty, give score 0.
- If the answer is random or meaningless text, give score 0.
- Do NOT give marks simply because an answer exists.
- Evaluate the answer according to the actual question.
- Do not invent information that is not present in the candidate's answer.
- Be fair to beginner candidates.
- A short but correct answer can still receive a good score.
- Give a short and useful feedback for every answer.
- Return exactly one evaluation for every question.
- The question number must match the question position.

INTERVIEW QUESTIONS AND CANDIDATE ANSWERS:

${questions
  .map(
    (question, index) => `
Question ${index + 1}:
${question}

Candidate Answer:
${
  answers[index] &&
  answers[index].trim() !== ""
    ? answers[index]
    : "(No answer - skipped)"
}
`
  )
  .join("\n")}

RETURN ONLY THIS JSON FORMAT:

[
  {
    "questionNumber": 1,
    "score": 0,
    "feedback": "Short feedback about the candidate's answer."
  }
]

IMPORTANT:

- Return one object for every question.
- Do not return markdown.
- Do not return explanations outside the JSON.
- Do not use percentage values.
- Score must be an integer from 0 to 10.
`;

      // ==========================================
      // DEBUG INFORMATION
      // ==========================================

      console.log(
        "================================="
      );

      console.log(
        "Gemini AI Answer Evaluation Started."
      );

      console.log(
        "Total Questions:",
        questions.length
      );

      console.log(
        "================================="
      );

      // ==========================================
      // CALL GEMINI
      // ==========================================

      const response =
        await ai.models.generateContent({
          model:
            "gemini-3.5-flash",

          contents:
            prompt,

          config: {
            responseMimeType:
              "application/json"
          }
        });

      // Gemini ka raw response
      const responseText =
        response.text;

      // ==========================================
      // SHOW GEMINI RESPONSE
      // ==========================================

      console.log(
        "Gemini Evaluation Response:"
      );

      console.log(
        responseText
      );

      // ==========================================
      // CONVERT GEMINI JSON
      // ==========================================

      const evaluations =
        JSON.parse(
          responseText
        );

      // ==========================================
      // VALIDATE GEMINI RESPONSE
      // ==========================================

      if (
        !Array.isArray(
          evaluations
        )
      ) {
        throw new Error(
          "Gemini did not return an evaluation array."
        );
      }

      // Gemini ko har question ke liye
      // evaluation return karni chahiye
      if (
        evaluations.length !==
        questions.length
      ) {
        throw new Error(
          "Gemini evaluation count does not match question count."
        );
      }

      // ==========================================
      // CLEAN EVALUATION DATA
      // ==========================================

      const cleanEvaluations =
        evaluations.map(
          (evaluation, index) => {
            let score =
              Number(
                evaluation.score
              );

            // Invalid score ko 0 karna
            if (
              Number.isNaN(score)
            ) {
              score = 0;
            }

            // Score ko 0-10 ke range me rakhna
            score = Math.round(
              Math.max(
                0,
                Math.min(
                  10,
                  score
                )
              )
            );

            // Empty answer ke liye
            // score hamesha 0 hona chahiye
            if (
              !answers[index] ||
              answers[index].trim() === ""
            ) {
              score = 0;
            }

            return {
              questionNumber:
                index + 1,

              score:
                score,

              feedback:
                typeof evaluation.feedback ===
                "string"
                  ? evaluation.feedback
                  : "No feedback available."
            };
          }
        );

      // ==========================================
      // CALCULATE TOTAL AI SCORE
      // ==========================================

      const totalScore =
        cleanEvaluations.reduce(
          (
            total,
            evaluation
          ) =>
            total +
            evaluation.score,
          0
        );

      const maxScore =
        questions.length * 10;

      // ==========================================
      // DEBUG FINAL EVALUATION
      // ==========================================

      console.log(
        "AI Evaluation Completed."
      );

      console.log(
        "Total AI Score:",
        totalScore,
        "/",
        maxScore
      );

      console.log(
        "Evaluations:",
        cleanEvaluations
      );

      // ==========================================
      // SEND RESULT TO FRONTEND
      // ==========================================

      res.json({
        success: true,

        evaluations:
          cleanEvaluations,

        totalScore:
          totalScore,

        maxScore:
          maxScore
      });

    } catch (error) {
      // ==========================================
      // GEMINI EVALUATION ERROR
      // ==========================================

      console.error(
        "Gemini Answer Evaluation Error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Failed to evaluate interview answers.",

        error:
          error.message
      });
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

// ==========================================
// GEMINI AI ANSWER EVALUATION API
// ==========================================
// User ke interview answers ko Gemini evaluate karega.
// Har answer ko 0-10 score aur short feedback milega.
// ==========================================

app.post(
  "/api/evaluate-interview-answers",
  async (req, res) => {
    try {
      // Frontend se questions aur answers receive karna
      const {
        questions,
        answers
      } = req.body;

      // ==========================================
      // BASIC VALIDATION
      // ==========================================

      if (
        !Array.isArray(questions) ||
        !Array.isArray(answers)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Questions and answers must be arrays."
        });
      }

      // Questions aur answers ki count same honi chahiye
      if (
        questions.length !== answers.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Questions and answers count must be equal."
        });
      }

      // ==========================================
      // GEMINI EVALUATION PROMPT
      // ==========================================

      const prompt = `
You are an expert technical interview evaluator.

Evaluate the candidate's answers to the interview questions.

For every question, evaluate the answer based on:

1. Correctness
2. Relevance
3. Completeness
4. Technical understanding
5. Clarity

SCORING SYSTEM:

0 = No answer, skipped, meaningless text, or completely incorrect

1-2 = Very poor answer

3-4 = Weak answer with major problems

5-6 = Average answer with basic understanding

7-8 = Good answer with correct understanding

9 = Very good answer with strong understanding

10 = Excellent answer with accurate, complete and clear understanding

IMPORTANT RULES:

- If the answer is empty, give score 0.
- If the answer is random or meaningless text, give score 0.
- Do NOT give marks simply because an answer exists.
- Evaluate the answer according to the actual question.
- Do not invent information that is not present in the candidate's answer.
- Be fair to beginner candidates.
- A short but correct answer can still receive a good score.
- Give a short and useful feedback for every answer.
- Return exactly one evaluation for every question.
- The question number must match the question position.

INTERVIEW QUESTIONS AND CANDIDATE ANSWERS:

${questions
  .map(
    (question, index) => `
Question ${index + 1}:
${question}

Candidate Answer:
${
  answers[index] &&
  answers[index].trim() !== ""
    ? answers[index]
    : "(No answer - skipped)"
}
`
  )
  .join("\n")}

RETURN ONLY THIS JSON FORMAT:

[
  {
    "questionNumber": 1,
    "score": 0,
    "feedback": "Short feedback about the candidate's answer."
  }
]

IMPORTANT:

- Return one object for every question.
- Do not return markdown.
- Do not return explanations outside the JSON.
- Do not use percentage values.
- Score must be an integer from 0 to 10.
`;

      // ==========================================
      // DEBUG INFORMATION
      // ==========================================

      console.log(
        "================================="
      );

      console.log(
        "Gemini AI Answer Evaluation Started."
      );

      console.log(
        "Total Questions:",
        questions.length
      );

      console.log(
        "================================="
      );

      // ==========================================
      // CALL GEMINI
      // ==========================================

      const response =
        await ai.models.generateContent({
          model:
            "gemini-3.5-flash",

          contents:
            prompt,

          config: {
            responseMimeType:
              "application/json"
          }
        });

      // Gemini ka raw response
      const responseText =
        response.text;

      // ==========================================
      // SHOW GEMINI RESPONSE
      // ==========================================

      console.log(
        "Gemini Evaluation Response:"
      );

      console.log(
        responseText
      );

      // ==========================================
      // CONVERT GEMINI JSON
      // ==========================================

      const evaluations =
        JSON.parse(
          responseText
        );

      // ==========================================
      // VALIDATE GEMINI RESPONSE
      // ==========================================

      if (
        !Array.isArray(
          evaluations
        )
      ) {
        throw new Error(
          "Gemini did not return an evaluation array."
        );
      }

      // Gemini ko har question ke liye
      // evaluation return karni chahiye
      if (
        evaluations.length !==
        questions.length
      ) {
        throw new Error(
          "Gemini evaluation count does not match question count."
        );
      }

      // ==========================================
      // CLEAN EVALUATION DATA
      // ==========================================

      const cleanEvaluations =
        evaluations.map(
          (evaluation, index) => {
            let score =
              Number(
                evaluation.score
              );

            // Invalid score ko 0 karna
            if (
              Number.isNaN(score)
            ) {
              score = 0;
            }

            // Score ko 0-10 ke range me rakhna
            score = Math.round(
              Math.max(
                0,
                Math.min(
                  10,
                  score
                )
              )
            );

            // Empty answer ke liye
            // score hamesha 0 hona chahiye
            if (
              !answers[index] ||
              answers[index].trim() === ""
            ) {
              score = 0;
            }

            return {
              questionNumber:
                index + 1,

              score:
                score,

              feedback:
                typeof evaluation.feedback ===
                "string"
                  ? evaluation.feedback
                  : "No feedback available."
            };
          }
        );

      // ==========================================
      // CALCULATE TOTAL AI SCORE
      // ==========================================

      const totalScore =
        cleanEvaluations.reduce(
          (
            total,
            evaluation
          ) =>
            total +
            evaluation.score,
          0
        );

      const maxScore =
        questions.length * 10;

      // ==========================================
      // DEBUG FINAL EVALUATION
      // ==========================================

      console.log(
        "AI Evaluation Completed."
      );

      console.log(
        "Total AI Score:",
        totalScore,
        "/",
        maxScore
      );

      console.log(
        "Evaluations:",
        cleanEvaluations
      );

      // ==========================================
      // SEND RESULT TO FRONTEND
      // ==========================================

      res.json({
        success: true,

        evaluations:
          cleanEvaluations,

        totalScore:
          totalScore,

        maxScore:
          maxScore
      });

    } catch (error) {
      // ==========================================
      // GEMINI EVALUATION ERROR
      // ==========================================

      console.error(
        "Gemini Answer Evaluation Error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Failed to evaluate interview answers.",

        error:
          error.message
      });
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

const PORT = 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);
























