import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/profile", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setMessage(data.message);
        } else {
          setMessage(data.message);
        }
      })
      .catch((error) => {
        console.error("Profile error:", error);
        setMessage("Server connection failed.");
      });
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
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#172554",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid #3730a3"
        }}
      >
        <h1>My Profile</h1>

        <p>{message}</p>

        {user && (
          <div>
            <p>
              <strong>ID:</strong> {user.id}
            </p>

            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Profile;