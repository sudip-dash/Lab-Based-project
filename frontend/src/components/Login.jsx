import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import PasswordInput from "./PasswordInput.jsx";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/user/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("currentlyLoggedIn", true);
        navigate("/home");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Login failed", error);
      setErrorMessage(
        `Login failed: May be either password or email is wrong [ ${
          error.response?.data?.message || error.message
        }]`
      );
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Welcome Back</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={styles.input}
          required
        />

        <PasswordInput
          name="password"
          placeholder="Password"
          onChange={handleChange}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>
          Login
        </button>

        {errorMessage && <p style={styles.error}>{errorMessage}</p>}

        <div style={styles.linkGroup}>
          <Link to="/" style={styles.link}>
            Don't have an account? <strong>Signup</strong>
          </Link>
          <Link to="/forgot-password" style={styles.link}>
            Forgot your password? <strong>Reset</strong>
          </Link>
        </div>
      </form>

      {/* Internal animation and placeholder styling */}
      <style>{`
        @keyframes backgroundScroll {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        input::placeholder {
          color: #999;
          font-style: italic;
        }

        input:focus::placeholder {
          color: #007bff;
        }

        input:focus {
          border-color: #007bff;
          box-shadow: 0 0 10px rgba(0, 123, 255, 0.2);
        }

        button:hover {
          transform: scale(1.02);
          box-shadow: 0 0 10px rgba(40, 167, 69, 0.4);
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    minWidth: "100vw",
    background: "linear-gradient(-45deg, #c2e9fb, #a1c4fd, #fbc2eb, #fcd5ce)",
    backgroundSize: "400% 400%",
    animation: "backgroundScroll 12s ease infinite",
    padding: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    padding: "40px",
    borderRadius: "25px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 12px 25px rgba(0, 0, 0, 0.1)",
    alignItems: "center",
    animation: "fadeSlide 0.5s ease",
  },
  heading: {
    fontSize: "2.2rem",
    fontWeight: "800",
    marginBottom: "25px",
    background: "linear-gradient(to right, #1a2a49, #007bff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontFamily: "'Poppins', sans-serif",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "20px",
    borderRadius: "12px",
    border: "1px solid #ccc",
    fontSize: "16px",
    outline: "none",
    background: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease",
    color: "#333",
    fontFamily: "'Poppins', sans-serif",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    background: "linear-gradient(135deg, #007bff, #0056b3)",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  error: {
    marginTop: "15px",
    color: "#dc3545",
    fontWeight: "500",
    fontSize: "14px",
    textAlign: "center",
  },
  linkGroup: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "center",
  },
  link: {
    color: "#007bff",
    fontSize: "14px",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Login;
