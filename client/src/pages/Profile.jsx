import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  // Store logged-in user information
  const [user, setUser] = useState(null);

  // Store profile status or error message
  const [message, setMessage] = useState("");

  // Store the user's interview history
  const [interviews, setInterviews] = useState([]);

  // Track whether profile data is loading
  const [loading, setLoading] = useState(true);

  // Used for navigating between pages
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = () => {
    // Remove login information from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to Login page
    navigate("/login");
  };

  useEffect(() => {
    // Get JWT token from localStorage
    const token = localStorage.getItem("token");

    // If token does not exist, user is not logged in
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch protected profile information
    const loadProfile = async () => {
      try {
        // Request logged-in user's profile
        const profileResponse = await fetch(
          "http://localhost:5000/profile",
          {
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );

        // Convert profile response to JSON
        const profileData = await profileResponse.json();

        // Stop if profile request failed
        if (!profileResponse.ok || !profileData.user) {
          setMessage(
            profileData.message || "Failed to load profile."
          );
          setLoading(false);
          return;
        }

        // Save logged-in user information
        setUser(profileData.user);

        // Show profile success message
        setMessage(profileData.message || "");

        // Get the logged-in user's ID
        const userId = profileData.user.id;

        // Fetch only this user's interview history
        const interviewResponse = await fetch(
          `http://localhost:5000/api/interviews/${userId}`
        );

        // Convert interview response to JSON
        const interviewData = await interviewResponse.json();

        // Check interview history request
        if (!interviewResponse.ok) {
          setMessage(
            interviewData.message ||
              "Failed to load interview history."
          );
          setInterviews([]);
        } else {
          // Store interview history
          setInterviews(interviewData);
        }
      } catch (error) {
        // Handle server/network errors
        console.error("Profile error:", error);

        setMessage(
          "Server connection failed. Please make sure the backend is running."
        );
      } finally {
        // Stop loading after all requests finish
        setLoading(false);
      }
    };

    // Load profile and interview history
    loadProfile();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          backgroundColor: "#172554",
          padding: "40px",
          borderRadius: "18px",
          border: "1px solid #3730a3",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)"
        }}
      >
        {/* Profile page heading */}
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "32px"
          }}
        >
          My Profile
        </h1>

        {/* Profile status message */}
        <p
          style={{
            color: "#a5b4fc",
            marginBottom: "30px"
          }}
        >
          {message}
        </p>

        {/* Show loading message while data is being fetched */}
        {loading ? (
          <div
            style={{
              backgroundColor: "#0f172a",
              padding: "25px",
              borderRadius: "12px",
              color: "#cbd5e1",
              textAlign: "center",
              marginBottom: "30px"
            }}
          >
            Loading profile...
          </div>
        ) : (
          <>
            {/* User profile information */}
            {user && (
              <div
                style={{
                  backgroundColor: "#0f172a",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "30px",
                  border: "1px solid #334155"
                }}
              >
                <p style={{ margin: "0 0 15px" }}>
                  <strong>Name:</strong> {user.name}
                </p>

                <p style={{ margin: "0 0 15px" }}>
                  <strong>ID:</strong> {user.id}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            )}

            {/* Interview History Section */}
            <div style={{ marginBottom: "30px" }}>
              <h2
                style={{
                  margin: "0 0 18px",
                  fontSize: "24px"
                }}
              >
                Interview History
              </h2>

              {/* Show message when no interviews exist */}
              {interviews.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "#0f172a",
                    padding: "20px",
                    borderRadius: "12px",
                    color: "#cbd5e1",
                    border: "1px solid #334155"
                  }}
                >
                  No interview history found.
                </div>
              ) : (
                /* Display every interview attempt */
                interviews.map((interview) => (
                  <div
                    key={interview.id}
                    style={{
                      backgroundColor: "#0f172a",
                      padding: "20px",
                      borderRadius: "12px",
                      marginBottom: "15px",
                      border: "1px solid #334155"
                    }}
                  >
                    {/* Display interview role */}
                    <h3
                      style={{
                        margin: "0 0 8px",
                        color: "#ffffff",
                        fontSize: "19px"
                      }}
                    >
                      {interview.role}
                    </h3>

                    {/* Display attempt number calculated by backend */}
                    <p
                      style={{
                        margin: "0 0 15px",
                        color: "#a5b4fc",
                        fontSize: "15px"
                      }}
                    >
                      Attempt {interview.attempt_number || 1}
                    </p>

                    {/* Open complete interview details */}
                    <button
                      onClick={() =>
                        navigate(
                          `/interview-details/${interview.id}`
                        )
                      }
                      style={{
                        padding: "10px 18px",
                        backgroundColor: "#4f46e5",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Profile action buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          {/* Return to Home page */}
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 22px",
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600"
            }}
          >
            Back to Home
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              padding: "12px 22px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600"
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;