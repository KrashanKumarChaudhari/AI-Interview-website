const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

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

app.get("/api/interviews/details/:id", async (req, res) => {
  try {

    // Get interview ID from URL
    const { id } = req.params;


    // Validate interview ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "Invalid interview ID."
      });
    }


    // Find the selected interview
    const result = await pool.query(
      `SELECT *
       FROM interviews
       WHERE id = $1`,
      [Number(id)]
    );


    // Interview not found
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Interview not found"
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
      message: "Failed to fetch interview details"
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