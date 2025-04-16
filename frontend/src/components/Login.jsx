import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import PasswordInput from "./PasswordInput.jsx";
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(""); // Store error message

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
        alert(response.data.message); // Access message properly
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <form
        className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border border-black p-2 m-2 rounded-lg w-72"
          required
        />
        <PasswordInput
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button
          className="border border-black p-2 m-2 bg-blue-600 rounded-2xl text-white w-72"
          type="submit"
        >
          Login
        </button>
      </form>

      {errorMessage && (
        <p className="text-red-600 font-medium mt-2 text-center w-72">
          {errorMessage}
        </p>
      )}

      <div className="mt-4 flex flex-col items-center gap-1">
        <Link
          to="/"
          className="text-blue-500 hover:text-amber-800 active:text-red-600"
        >
          Don't have an account? Signup
        </Link>
        <Link
          to="/forgot-password"
          className="text-blue-500 hover:text-amber-800 active:text-red-600"
        >
          Don't remember your password? Reset
        </Link>
      </div>
    </div>
  );
};

export default Login;
