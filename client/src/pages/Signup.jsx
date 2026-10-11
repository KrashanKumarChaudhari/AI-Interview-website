
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // Register a new user using the existing backend API.
  const handleSignup = async (e) => {
    e.preventDefault();

    if (name.trim() === "" || email.trim() === "" || password === "") {
      alert("Please fill all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Account created successfully!");

      // Send the user to the login page after registration.
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server connection failed.");
    }
  };

  return (
    <main className="login-page">
      {/* Decorative background glows match the login page */}
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <section className="login-card signup-card">
        {/* AI Interview branding */}
        <div className="login-brand">
          <div className="login-brand-icon">✧</div>
          <span>
            AI INTERVIEW <strong>STUDIO</strong>
          </span>
        </div>

        <div className="login-heading">
          <div className="login-status">
            <span className="login-status-dot" />
            START YOUR JOURNEY
          </div>

          <h1>
            Create <span>Account.</span>
          </h1>

          <p>
            Build your profile and get ready for AI-powered interview practice.
          </p>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSignup} className="login-form">
          <div className="login-field">
            <label htmlFor="signup-name">Full Name</label>

            <div className="login-input-wrap">
              <span className="login-input-icon">♙</span>
              <input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="signup-email">Email Address</label>

            <div className="login-input-wrap">
              <span className="login-input-icon">@</span>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="signup-password">Create Password</label>

            <div className="login-input-wrap">
              <span className="login-input-icon">⌑</span>
              <input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn signup-submit-btn">
            <span>Create Your Account</span>
            <span className="login-btn-arrow">→</span>
          </button>
        </form>

        <div className="login-divider">
          <span />
          <small>ALREADY PART OF THE JOURNEY?</small>
          <span />
        </div>

        {/* Existing users can return to login */}
        <button
          type="button"
          className="login-secondary-btn"
          onClick={() => navigate("/login")}
        >
          <span>Already have an account? Login</span>
          <span>↗</span>
        </button>

        <button
          type="button"
          className="login-home-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        <div className="login-security-note">
          <span>◇</span> One account. Smarter interview preparation.
        </div>
      </section>
    </main>
  );
}

export default Signup;
