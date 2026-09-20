import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "" || password === "") {
      alert("Please enter email and password.");
      return;
    }

    alert("Login successful!");

    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box"
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#172554",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid #3730a3",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          boxSizing: "border-box"
        }}
      >

        <h1
          style={{
            textAlign: "center",
            color: "#ffffff",
            marginBottom: "10px"
          }}
        >
          Welcome Back
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#cbd5e1",
            marginBottom: "30px"
          }}
        >
          Login to your AI Interview account
        </p>


        <form onSubmit={handleLogin}>

          <label
            style={{
              display: "block",
              color: "#ffffff",
              fontWeight: "600",
              marginBottom: "8px"
            }}
          >
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #64748b",
              boxSizing: "border-box",
              fontSize: "15px"
            }}
          />


          <label
            style={{
              display: "block",
              color: "#ffffff",
              fontWeight: "600",
              marginBottom: "8px"
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "25px",
              borderRadius: "8px",
              border: "1px solid #64748b",
              boxSizing: "border-box",
              fontSize: "15px"
            }}
          />


          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Login
          </button>

        </form>


        <button
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "12px",
            backgroundColor: "transparent",
            color: "#cbd5e1",
            border: "1px solid #64748b",
            borderRadius: "8px",
            fontSize: "15px",
            cursor: "pointer"
          }}
        >
          Back to Home
        </button>

      </div>

    </div>
  );
}

export default Login;