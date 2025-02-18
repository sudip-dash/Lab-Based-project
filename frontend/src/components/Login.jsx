import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/user/login", {
        email:formData.email,
        password:formData.password
      },{withCredentials:true});

      
      if (response.status == 200) {
        localStorage.setItem("accessToken", response.accessToken);
        navigate("/home");
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border-black p-2 m-2 rounded-lg"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="border-black p-2 m-2 rounded-lg"
          required
        />
        <button className="border-black p-2 m-2 bg-blue-600 rounded-2xl text-white" type="submit">Login</button>
      </form>
      <Link to="/" className="text-blue-500 hover:text-amber-800 active:text-red-600">Don't have an account ? Signup</Link>
      <Link to="/forgot-password" className="text-blue-500 hover:text-amber-800 active:text-red-600">Don't have an account ? Signup</Link>
    </>
  );
};

export default Login;
