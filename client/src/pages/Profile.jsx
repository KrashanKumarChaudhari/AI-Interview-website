
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Clear login data and return to the Login page.
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Profile is available only to logged-in users.
    if (!token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        // Fetch protected profile information.
        const profileResponse = await fetch(
          "http://localhost:5000/profile",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const profileData = await profileResponse.json();

        if (!profileResponse.ok || !profileData.user) {
          setMessage(
            profileData.message || "Failed to load profile."
          );
          return;
        }

        setUser(profileData.user);
        setMessage("");

        // Fetch interview attempts belonging to this user.
        const userId = profileData.user.id;

        const interviewResponse = await fetch(
          `http://localhost:5000/api/interviews/${userId}`
        );

        const interviewData = await interviewResponse.json();

        if (!interviewResponse.ok) {
          setMessage(
            interviewData.message ||
              "Failed to load interview history."
          );
          setInterviews([]);
        } else {
          setInterviews(
            Array.isArray(interviewData) ? interviewData : []
          );
        }
      } catch (error) {
        console.error("Profile error:", error);
        setMessage(
          "Server connection failed. Please check whether the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // Get initials for the user's profile avatar.
  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <main className="profile-page">
      <div className="profile-orb profile-orb-one" />
      <div className="profile-orb profile-orb-two" />

      <div className="profile-dashboard">
        {/* Dashboard heading */}
        <header className="profile-header">
          <div>
            <div className="profile-eyebrow">
              <span className="profile-status-dot" />
              AI MOCK INTERVIEW SYSTEM
            </div>

            <h1>My Profile</h1>

            <p className="profile-subtitle">
              Manage your account and track your interview journey.
            </p>
          </div>

          <button
            className="profile-back-btn"
            onClick={() => navigate("/")}
          >
            <span aria-hidden="true">←</span> Home
          </button>
        </header>

        {/* Loading state */}
        {loading ? (
          <section className="profile-state-card">
            <div className="profile-loader" />
            <h2>Loading your dashboard</h2>
            <p>Fetching your profile and interview history...</p>
          </section>
        ) : (
          <>
            {/* Account information */}
            {user && (
              <section className="profile-user-card">
                <div className="profile-user-main">
                  <div className="profile-avatar">{initials}</div>

                  <div className="profile-user-text">
                    <span className="profile-card-label">
                      ACCOUNT OVERVIEW
                    </span>

                    <h2>{user.name || "User"}</h2>

                    <p>{user.email || "Email not available"}</p>
                  </div>
                </div>

                <div className="profile-account-badge">
                  <span className="profile-status-dot" />
                  Account Active
                </div>

                <div className="profile-user-meta">
                  <div className="profile-meta-item">
                    <span>User ID</span>
                    <strong>#{user.id}</strong>
                  </div>

                  <div className="profile-meta-item">
                    <span>Account Name</span>
                    <strong>{user.name || "User"}</strong>
                  </div>

                  <div className="profile-meta-item">
                    <span>Interview Attempts</span>
                    <strong>{interviews.length}</strong>
                  </div>
                </div>
              </section>
            )}

            {/* Show request errors without hiding the rest of the page. */}
            {message && (
              <div className="profile-error" role="alert">
                <span aria-hidden="true">!</span>
                {message}
              </div>
            )}

            {/* Interview history */}
            <section className="profile-history-section">
              <div className="profile-section-heading">
                <div>
                  <span className="profile-card-label">
                    YOUR PROGRESS
                  </span>
                  <h2>Interview History</h2>
                  <p>
                    Review each attempt and open its detailed results.
                  </p>
                </div>

                <div className="profile-history-count">
                  {interviews.length}{" "}
                  {interviews.length === 1 ? "ATTEMPT" : "ATTEMPTS"}
                </div>
              </div>

              {interviews.length === 0 ? (
                <div className="profile-empty-state">
                  <div className="profile-empty-icon">
                    <span aria-hidden="true">◈</span>
                  </div>

                  <h3>No interviews yet</h3>

                  <p>
                    Your completed interview attempts will appear here.
                    Start an interview to begin tracking your progress.
                  </p>

                  <button
                    className="profile-primary-btn"
                    onClick={() => navigate("/interview-setup")}
                  >
                    Start an Interview <span aria-hidden="true">→</span>
                  </button>
                </div>
              ) : (
                <div className="profile-interview-list">
                  {interviews.map((interview) => (
                    <article
                      className="profile-interview-card"
                      key={interview.id}
                    >
                      <div className="profile-interview-icon">
                        <span aria-hidden="true">⌘</span>
                      </div>

                      <div className="profile-interview-info">
                        <h3>{interview.role || "Mock Interview"}</h3>

                        <p>
                          Attempt {interview.attempt_number || 1}
                          <span className="profile-inline-dot">•</span>
                          Interview ID #{interview.id}
                        </p>
                      </div>

                      <button
                        className="profile-details-btn"
                        onClick={() =>
                          navigate(
                            `/interview-details/${interview.id}`
                          )
                        }
                      >
                        View Details <span aria-hidden="true">↗</span>
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Account actions */}
            <footer className="profile-footer">
              <p>
                <span className="profile-footer-indicator" />
                Your interview journey, all in one place.
              </p>

              <button
                className="profile-logout-btn"
                onClick={handleLogout}
              >
                <span aria-hidden="true">↪</span> Logout
              </button>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

export default Profile;
