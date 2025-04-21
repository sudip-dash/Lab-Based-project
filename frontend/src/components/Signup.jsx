import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import PasswordInput from "./PasswordInput.jsx";

const Signup = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/user/signup",
        formData,
        { withCredentials: true }
      );

      if (response.data.message === "user do exist") {
        setErrorMessage("User already exists. Please log in.");
      } else {
        navigate("/login");
      }
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Something went wrong.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Create Account</h2>

        <input
          type="text"
          name="userName"
          placeholder="Username"
          onChange={handleChange}
          style={styles.input}
          required
        />

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
          Sign Up
        </button>

        {errorMessage && <p style={styles.error}>{errorMessage}</p>}

        <Link to="/login" style={styles.link}>
          Already have an account? <strong>Log in</strong>
        </Link>
      </form>

      {/* Global keyframes and input placeholder enhancements */}
      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.03); opacity: 1; }
          100% { transform: scale(1); }
        }

        @keyframes popIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        input::placeholder {
          color: #999;
          font-style: italic;
          transition: color 0.3s ease;
        }

        input:focus::placeholder {
          color: #007bff;
        }

        input:focus {
          border-color: #007bff;
          box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
          background-color: rgba(255, 255, 255, 0.9);
        }

        button:hover {
          animation: bounceIn 0.4s ease-in-out forwards;
        }

        @keyframes backgroundMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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
    padding: "20px",
    background: "linear-gradient(135deg, #c2e9fb, #a1c4fd, #d4fc79)",
    backgroundSize: "400% 400%",
    animation: "backgroundMove 15s ease infinite",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    padding: "40px 30px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "25px",
    boxShadow: "0 12px 25px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    alignItems: "center",
    animation: "popIn 0.6s ease",
  },
  heading: {
    fontSize: "2.2rem",
    fontWeight: "800",
    marginBottom: "30px",
    background: "linear-gradient(to right, #1a2a49, #007bff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontFamily: "'Poppins', sans-serif",
    textAlign: "center",
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
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #28a745, #218838)",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  error: {
    marginTop: "15px",
    color: "#dc3545",
    fontWeight: "500",
    fontSize: "15px",
    textAlign: "center",
  },
  link: {
    marginTop: "20px",
    color: "#007bff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default Signup;
