// Interview details page
import InterviewDetails from "./pages/InterviewDetails";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Result from "./pages/Result";
import Interview from "./pages/Interview";
import Login from "./pages/Login";


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
  const isLoggedIn = localStorage.getItem("token");
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
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        scrollBehavior: "smooth"
      }}
    >

      {/* NAVBAR */}

      <nav
        className="navbar"
        style={{
          backgroundColor: "#0f172a"
        }}
      >

        <div
          className="logo"
          style={{
            color: "#ffffff",
            fontWeight: "700"
          }}
        >
          AI Interview
        </div>

        <div className="nav-links">

          <Link
            to="/"
            style={{
              color: "#ffffff",
              fontWeight: "600"
            }}
          >
            Home
          </Link>

          <Link
            to="/#about"
            style={{
              color: "#ffffff",
              fontWeight: "600"
            }}
          >
            About
          </Link>

          <Link
            to="/#features"
            style={{
              color: "#ffffff",
              fontWeight: "600"
            }}
          >
            Features
          </Link>

          {/* LOGIN */}

          {!isLoggedIn && (
  <Link
    to="/login"
    style={{
      textDecoration: "none"
    }}
  >
    <button
      className="login-btn"
      style={{
        color: "#ffffff",
        fontWeight: "600"
      }}
    >
      Login
    </button>
  </Link>
)}

        {isLoggedIn && (
  <Link
    to="/profile"
    style={{
      textDecoration: "none"
    }}
  >
    <button
     style={{
  color: "#ffffff",
  backgroundColor: "#4f46e5",
  fontWeight: "600",
  border: "none",
  borderRadius: "8px",
  padding: "10px 20px",
  marginLeft: "10px",
  cursor: "pointer"
}}
    >
      Profile
    </button>
  </Link>
)}

        </div>

      </nav>


      {/* HERO SECTION */}

      <main
        className="hero"
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px 20px",
          backgroundColor: "#0f172a",
          boxSizing: "border-box"
        }}
      >

        <div
          className="hero-content"
          style={{
            maxWidth: "850px"
          }}
        >

          <p
            className="badge"
            style={{
              color: "#a5b4fc",
              fontWeight: "700",
              fontSize: "16px"
            }}
          >
            🤖 AI-Powered Interview Practice
          </p>

          <h1
            style={{
              color: "#ffffff",
              fontSize: "48px",
              fontWeight: "800",
              lineHeight: "1.2",
              marginBottom: "22px"
            }}
          >
            Prepare for your

            <span
              style={{
                color: "#818cf8"
              }}
            >
              {" "}Dream Interview
            </span>

          </h1>

          <p
            className="description"
            style={{
              color: "#cbd5e1",
              fontSize: "18px",
              fontWeight: "500",
              lineHeight: "1.8",
              maxWidth: "700px",
              margin: "0 auto 30px"
            }}
          >
            Practice real interview questions with AI,
            improve your answers, and get instant
            personalized feedback.
          </p>

          <Link to="/interview-setup">

            <button
              className="start-btn"
              style={{
                color: "#ffffff",
                fontWeight: "700",
                padding: "14px 28px",
                fontSize: "17px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Start Interview →
            </button>

          </Link>

        </div>

      </main>


      {/* ABOUT SECTION */}

      <section
        id="about"
        style={{
          padding: "80px 20px",
          textAlign: "center",
          backgroundColor: "#0f172a",
          color: "#ffffff"
        }}
      >

        <h2
          style={{
            color: "#ffffff",
            fontSize: "34px",
            fontWeight: "800",
            marginBottom: "18px"
          }}
        >
          About AI Interview
        </h2>

        <p
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            color: "#cbd5e1",
            fontSize: "17px",
            fontWeight: "500",
            lineHeight: "1.8"
          }}
        >
          AI Interview is a smart mock interview platform
          designed to help students and job seekers practice
          interviews, improve their answers, and build
          confidence before facing real interviews.
        </p>

      </section>


      {/* FEATURES SECTION */}

      <section
        id="features"
        style={{
          padding: "80px 20px",
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          flexWrap: "wrap",
          backgroundColor: "#0f172a",
          color: "#ffffff"
        }}
      >

        <h2
          style={{
            width: "100%",
            textAlign: "center",
            color: "#ffffff",
            fontSize: "34px",
            fontWeight: "800",
            marginBottom: "5px"
          }}
        >
          Powerful Features
        </h2>

        <p
          style={{
            width: "100%",
            textAlign: "center",
            color: "#cbd5e1",
            fontSize: "17px",
            fontWeight: "500",
            marginBottom: "25px"
          }}
        >
          Everything you need to improve your
          interview performance.
        </p>


        {/* FEATURE 1 */}

        <div
          style={{
            width: "260px",
            padding: "28px",
            backgroundColor: "#172554",
            color: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #3730a3",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            textAlign: "center",
            boxSizing: "border-box"
          }}
        >

          <h3
            style={{
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: "700"
            }}
          >
            🤖 AI Questions
          </h3>

          <p
            style={{
              color: "#dbeafe",
              fontSize: "15px",
              fontWeight: "500",
              lineHeight: "1.7"
            }}
          >
            Get intelligent interview questions based on
            your selected role.
          </p>

        </div>


        {/* FEATURE 2 */}

        <div
          style={{
            width: "260px",
            padding: "28px",
            backgroundColor: "#172554",
            color: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #3730a3",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            textAlign: "center",
            boxSizing: "border-box"
          }}
        >

          <h3
            style={{
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: "700"
            }}
          >
            📊 Smart Feedback
          </h3>

          <p
            style={{
              color: "#dbeafe",
              fontSize: "15px",
              fontWeight: "500",
              lineHeight: "1.7"
            }}
          >
            Understand your strengths and areas for
            improvement.
          </p>

        </div>


        {/* FEATURE 3 */}

        <div
          style={{
            width: "260px",
            padding: "28px",
            backgroundColor: "#172554",
            color: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #3730a3",
            boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            textAlign: "center",
            boxSizing: "border-box"
          }}
        >

          <h3
            style={{
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: "700"
            }}
          >
            🎯 Track Progress
          </h3>

          <p
            style={{
              color: "#dbeafe",
              fontSize: "15px",
              fontWeight: "500",
              lineHeight: "1.7"
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

        <Route
          path="/login"
          element={<Login />}
        />

        <Route  
            path="/signup"
            element={<Signup />}
            />

            <Route path="/profile" element={<Profile />} />
            
  /* Route for viewing a single interview's details */
            <Route 
              path="/interview-details/:id"
              element={<InterviewDetails />}
            />  

      </Routes>

    </BrowserRouter>
  );
}

export default App;