import Interview from "./pages/Interview";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import InterviewSetup from "./pages/InterviewSetup";

function Home() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">AI Interview</div>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Features</a>
          <button className="login-btn">Login</button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <p className="badge">🤖 AI-Powered Interview Practice</p>

          <h1>
            Prepare for your
            <span> Dream Interview</span>
          </h1>

          <p className="description">
            Practice real interview questions with AI, improve your answers,
            and get instant personalized feedback.
          </p>

          <Link to="/interview-setup">
            <button className="start-btn">
              Start Interview →
            </button>
          </Link>
        </div>
      </main>

      <section className="features">
        <div className="feature-card">
          <h3>🤖 AI Questions</h3>
          <p>Get intelligent interview questions based on your role.</p>
        </div>

        <div className="feature-card">
          <h3>📊 Smart Feedback</h3>
          <p>Understand your strengths and areas for improvement.</p>
        </div>

        <div className="feature-card">
          <h3>🎯 Track Progress</h3>
          <p>Monitor your interview performance over time.</p>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
 <BrowserRouter>
  <Routes>

    <Route path="/" element={<Home />} />

    <Route path="/interview" element={<Interview />} />

    <Route
      path="/interview-setup"
      element={<InterviewSetup />}
    />

  </Routes>
</BrowserRouter>
  );
}

export default App;