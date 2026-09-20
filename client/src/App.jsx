import Result from "./pages/Result";
import Interview from "./pages/Interview";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import InterviewSetup from "./pages/InterviewSetup";
import { useEffect } from "react";

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const section = document.getElementById(
        location.hash.substring(1)
      );

      if (section) {
        setTimeout(() => {
          section.scrollIntoView({
            behavior: "smooth"
          });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div
      className="app"
      style={{
        scrollBehavior: "smooth",
        minHeight: "100vh"
      }}
    >

      {/* Navbar */}
      <nav className="navbar">

        <div className="logo">
          AI Interview
        </div>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/#about">
            About
          </Link>

          <Link to="/#features">
            Features
          </Link>

          <button className="login-btn">
            Login
          </button>

        </div>

      </nav>


      {/* Hero Section */}
      <main className="hero">

        <div className="hero-content">

          <p className="badge">
            🤖 AI-Powered Interview Practice
          </p>

          <h1>
            Prepare for your
            <span> Dream Interview</span>
          </h1>

          <p className="description">
            Practice real interview questions with AI,
            improve your answers, and get instant
            personalized feedback.
          </p>

          <Link to="/interview-setup">

            <button className="start-btn">
              Start Interview →
            </button>

          </Link>

        </div>

      </main>


      {/* About Section */}
      <section
        id="about"
        style={{
          padding: "70px 20px",
          textAlign: "center"
        }}
      >

        <h2
          style={{
            fontSize: "32px",
            marginBottom: "15px",
            color: "#222"
          }}
        >
          About AI Interview
        </h2>

        <p
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: "1.7",
            fontSize: "17px",
            color: "#555"
          }}
        >
          AI Interview is a smart mock interview platform
          designed to help students and job seekers practice
          interviews, improve their answers, and build
          confidence before facing real interviews.
        </p>

      </section>


      {/* Features Section */}
      <section
        id="features"
        style={{
          padding: "70px 20px",
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}
      >

        <h2
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: "32px",
            color: "#222",
            marginBottom: "5px"
          }}
        >
          Powerful Features
        </h2>

        <p
          style={{
            width: "100%",
            textAlign: "center",
            color: "#555",
            fontSize: "17px",
            marginBottom: "20px"
          }}
        >
          Everything you need to improve your
          interview performance.
        </p>


        {/* Feature 1 */}
        <div
          style={{
            width: "250px",
            padding: "25px",
            backgroundColor: "transparent",
            color: "#222",
            borderRadius: "12px",
            border: "1px solid #d5d8e5",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            boxSizing: "border-box"
          }}
        >

          <h3 style={{ color: "#222" }}>
            🤖 AI Questions
          </h3>

          <p
            style={{
              color: "#555",
              lineHeight: "1.6"
            }}
          >
            Get intelligent interview questions based on
            your selected role.
          </p>

        </div>


        {/* Feature 2 */}
        <div
          style={{
            width: "250px",
            padding: "25px",
            backgroundColor: "transparent",
            color: "#222",
            borderRadius: "12px",
            border: "1px solid #d5d8e5",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            boxSizing: "border-box"
          }}
        >

          <h3 style={{ color: "#222" }}>
            📊 Smart Feedback
          </h3>

          <p
            style={{
              color: "#555",
              lineHeight: "1.6"
            }}
          >
            Understand your strengths and areas for
            improvement.
          </p>

        </div>


        {/* Feature 3 */}
        <div
          style={{
            width: "250px",
            padding: "25px",
            backgroundColor: "transparent",
            color: "#222",
            borderRadius: "12px",
            border: "1px solid #d5d8e5",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            boxSizing: "border-box"
          }}
        >

          <h3 style={{ color: "#222" }}>
            🎯 Track Progress
          </h3>

          <p
            style={{
              color: "#555",
              lineHeight: "1.6"
            }}
          >
            Monitor your interview performance over
            time.
          </p>

        </div>

      </section>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/interview"
          element={<Interview />}
        />

        <Route
          path="/interview-setup"
          element={<InterviewSetup />}
        />

        <Route
          path="/result"
          element={<Result />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;