
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // Handle login without changing the existing backend API.
  const handleLogin = async (e) => {
    e.preventDefault();

    if (email === "" || password === "") {
      alert("Please enter email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Login successful!");

      // Store authentication details after a successful login.
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      alert("Server connection failed.");
    }
  };

  return (
    <main className="login-page">
      {/* Ambient background effects */}
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <section className="login-card">
        {/* Brand and heading */}
        <div className="login-brand">
          <div className="login-brand-icon">✧</div>
          <span>AI INTERVIEW <strong>STUDIO</strong></span>
        </div>

        <div className="login-heading">
          <div className="login-status">
            <span className="login-status-dot" />
            YOUR NEXT CAREER MOVE
          </div>

          <h1>
            Welcome <span>Back.</span>
          </h1>

          <p>Sign in to continue your AI-powered interview journey.</p>
        </div>

        {/* Existing login form and API integration */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="login-email">Email Address</label>

            <div className="login-input-wrap">
              <span className="login-input-icon">@</span>
              <input
                id="login-email"
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
            <label htmlFor="login-password">Password</label>

            <div className="login-input-wrap">
              <span className="login-input-icon">⌑</span>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            <span>Sign In to Your Account</span>
            <span className="login-btn-arrow">→</span>
          </button>
        </form>

        <div className="login-divider">
          <span />
          <small>YOUR INTERVIEW JOURNEY STARTS HERE</small>
          <span />
        </div>

        {/* Navigation buttons */}
        <button
          type="button"
          className="login-secondary-btn"
          onClick={() => navigate("/signup")}
        >
          <span>Create New Account</span>
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
          <span>◇</span> AI-powered practice. Your next opportunity.
        </div>
      </section>
    </main>
  );
}

export default Login;
