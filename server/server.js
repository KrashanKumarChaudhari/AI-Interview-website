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

// Gemini AI client create karna
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const app = express();

// Frontend (5173) ko backend (5000) se request karne ki permission
app.use(cors());

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
    // Original file name ko preserve kar rahe hain
    cb(null, Date.now() + "-" + file.originalname);
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
// RESUME UPLOAD API
// ==========================================

// Resume file receive karne ke liye API
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

      // Uploaded PDF ko read karna
      const fs = require("fs");

      // PDF file ka data read karna
      const pdfBuffer = fs.readFileSync(req.file.path);

      // PDF se text extract karna
     // PDF parser ka instance create karna
const parser = new PDFParse({
  data: pdfBuffer
});

// PDF se text extract karna
const pdfData = await parser.getText();

      // Extracted resume text
      const resumeText = pdfData.text;

      // Console me extracted text check karna
      console.log("=================================");
      console.log("Resume uploaded successfully");
      console.log("File:", req.file.originalname);
      console.log("Extracted Resume Text:");
      console.log(resumeText);
      console.log("=================================");

      // Frontend ko response bhejna
      res.json({
        message: "Resume uploaded and text extracted successfully.",
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,

        // Extracted resume text frontend ko bhej rahe hain
        resumeText: resumeText
      });

    } catch (error) {
      // Backend terminal me complete error show karo
      console.error(
        "Resume processing error:",
        error
      );

      res.status(500).json({
        message: "Failed to process resume.",
        error: error.message
      });
    }
  }
);

// Allow frontend requests from React/Vite
app.use(cors());

// Allow JSON data in request body
app.use(express.json());


// ===============================
// PostgreSQL Database Connection
// ===============================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// ===============================
// Basic Test Route
// ===============================

app.get("/", (req, res) => {
  res.send("AI Interview Backend is running!");
});


// ===============================
// Database Test Route
// ===============================

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully!",
      time: result.rows[0].now
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "Database connection failed."
    });
  }
});


// ===============================
// SIGNUP
// ===============================

app.post("/signup", async (req, res) => {
  try {
    // Get signup information from frontend
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    // Convert password into a secure hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user in PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    // Send created user information to frontend
    res.status(201).json({
      message: "Account created successfully!",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Signup error:", error.message);

    res.status(500).json({
      message: "Signup failed."
    });
  }
});


// ===============================
// LOGIN
// ===============================

app.post("/login", async (req, res) => {
  try {
    // Get login information from frontend
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    // Find user by email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // User does not exist
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const user = result.rows[0];

    // Compare entered password with hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    // Password is incorrect
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    // Send token and user information to frontend
    res.json({
      message: "Login successful!",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Login failed."
    });
  }
});


// ===============================
// JWT TOKEN VERIFICATION
// ===============================

function verifyToken(req, res, next) {
  // Get Authorization header
  const authHeader = req.headers.authorization;

  // Token does not exist
  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. No token provided."
    });
  }

  // Extract token from "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store decoded user information in request
    req.user = decoded;

    // Continue to protected route
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
}


// ===============================
// PROTECTED PROFILE ROUTE
// ===============================

app.get("/profile", verifyToken, async (req, res) => {
  try {
    // Get logged-in user's information
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    // User not found
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Send profile information
    res.json({
      message: "Protected profile accessed successfully!",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Profile error:", error.message);

    res.status(500).json({
      message: "Profile fetch failed."
    });
  }
});


// ==================================================
// SAVE COMPLETE INTERVIEW RESULT
// ==================================================

app.post("/api/interviews", async (req, res) => {
  try {
    // Get complete interview data from frontend
    const {
      user_id,
      role,
      experience,
      interview_type,
      score,
      total_questions,
      questions,
      answers
    } = req.body;


    // -------------------------------
    // Validate required interview data
    // -------------------------------

    if (
      !user_id ||
      !role ||
      !experience ||
      !interview_type ||
      score === undefined ||
      total_questions === undefined
    ) {
      return res.status(400).json({
        message: "Required interview data is missing."
      });
    }


    // -------------------------------
    // Validate questions and answers
    // -------------------------------

    if (
      !Array.isArray(questions) ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({
        message: "Questions and answers must be arrays."
      });
    }


    // -------------------------------
    // Debug information
    // -------------------------------
    // This helps us verify exactly what
    // the frontend is sending to the backend.

    console.log("=================================");
    console.log("Saving Interview Result");
    console.log("User ID:", user_id);
    console.log("Role:", role);
    console.log("Experience:", experience);
    console.log("Interview Type:", interview_type);
    console.log("Score:", score);
    console.log("Total Questions:", total_questions);
    console.log("Questions:", questions);
    console.log("Answers:", answers);
    console.log("=================================");


    // -------------------------------
    // Insert interview into database
    // -------------------------------

    const result = await pool.query(
      `INSERT INTO interviews
       (
         user_id,
         role,
         experience,
         interview_type,
         score,
         total_questions,
         questions,
         answers
       )
       VALUES
       (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7::jsonb,
         $8::jsonb
       )
       RETURNING *`,
      [
        user_id,
        role,
        experience,
        interview_type,
        score,
        total_questions,

        // Convert JavaScript arrays into JSON strings
        JSON.stringify(questions),
        JSON.stringify(answers)
      ]
    );


    // -------------------------------
    // Confirm successful database save
    // -------------------------------

    console.log(
      "Interview saved successfully. Database ID:",
      result.rows[0].id
    );


    // Send saved interview back to frontend
    res.status(201).json({
      message: "Interview result saved successfully",
      interview: result.rows[0]
    });

  } catch (error) {

    // Show complete database error in backend terminal
    console.error(
      "Error saving interview result:",
      error
    );

    res.status(500).json({
      message: "Failed to save interview result",
      error: error.message
    });
  }
});


// ==========================================
// GET INTERVIEW PERFORMANCE STATISTICS
// ==========================================

app.get("/api/interviews/stats/:userId", async (req, res) => {
  try {
    // Get user ID from the URL
    const { userId } = req.params;

    // Validate user ID
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({
        message: "Invalid user ID."
      });
    }

    // Calculate overall interview statistics
    const result = await pool.query(
      `SELECT
         COUNT(*) AS total_interviews,
         COALESCE(ROUND(AVG(score), 2), 0) AS average_score,
         COALESCE(MAX(score), 0) AS best_score,
         COALESCE(SUM(total_questions), 0) AS total_questions
       FROM interviews
       WHERE user_id = $1`,
      [Number(userId)]
    );

    // Send statistics to frontend
    res.json({
      total_interviews: Number(result.rows[0].total_interviews),
      average_score: Number(result.rows[0].average_score),
      best_score: Number(result.rows[0].best_score),
      total_questions: Number(result.rows[0].total_questions)
    });

  } catch (error) {
    // Show database error in backend terminal
    console.error(
      "Error fetching interview statistics:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch interview statistics."
    });
  }
});


// ==================================================
// GET USER INTERVIEW HISTORY
// ==================================================

app.get("/api/interviews/:userId", async (req, res) => {
  try {

    // Get user ID from URL
    const { userId } = req.params;


    // -------------------------------
    // Validate user ID
    // -------------------------------

    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({
        message: "Invalid user ID."
      });
    }


    // -------------------------------
    // Fetch user's interviews
    //
    // ROW_NUMBER creates:
    // Attempt 1
    // Attempt 2
    // Attempt 3
    //
    // Same role is counted separately.
    // Oldest attempt = Attempt 1
    // Newest attempt = highest attempt number.
    // -------------------------------

    const result = await pool.query(
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


    // Send interview history to frontend
    res.json(result.rows);

  } catch (error) {

    console.error(
      "Error fetching interview history:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch interview history"
    });
  }
});


// ==================================================
// GET SINGLE INTERVIEW DETAILS
// ==================================================

// ==========================================
// GET SINGLE INTERVIEW DETAILS
// Only the logged-in user's interview can be viewed
// ==========================================
app.get("/api/interviews/details/:id", verifyToken, async (req, res) => {
  try {

    // Get interview ID from the URL
    const { id } = req.params;

    // Get logged-in user ID from the verified JWT token
    const userId = req.user.id;

    // Validate interview ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid interview ID."
      });
    }

    // Find the interview only if it belongs to the logged-in user
    const result = await pool.query(
      `SELECT *
       FROM interviews
       WHERE id = $1
       AND user_id = $2`,
      [Number(id), userId]
    );

    // Interview not found or belongs to another user
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Interview not found."
      });
    }

    // Send complete interview details
    res.json(result.rows[0]);

  } catch (error) {

    console.error(
      "Error fetching interview details:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch interview details."
    });
  }
});

// ==========================================
// GEMINI API CONNECTION TEST
// ==========================================
// ==========================================
// CHECK AVAILABLE GEMINI MODELS
// ==========================================

// ==========================================
// GEMINI API CONNECTION TEST
// ==========================================

// ==========================================
// GEMINI API CONNECTION TEST
// ==========================================

app.get("/api/test-gemini", async (req, res) => {
  try {
    // Gemini se ek simple response mangna
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Say hello in one short sentence."
    });

    // Gemini ka response browser ko bhejna
    res.json({
      success: true,
      message: response.text
    });

  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      success: false,
      message: "Gemini API connection failed.",
      error: error.message
    });
  }
});


// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});