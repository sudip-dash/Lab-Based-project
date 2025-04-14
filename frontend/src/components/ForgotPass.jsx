import axios from "axios";
import React, { useState } from "react";

function ForgotPass() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8000/user/forgot-password",
        { email }
      );
      console.log(res.data.message);
    } catch (error) {
      console.error("Error sending reset link", error);
      alert("Error sending reset link. Try again.");
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          className="border-black p-2 m-2 rounded-lg"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          required
        />
        <br />
        <button
          className="border-black p-2 m-2 bg-blue-600 rounded-2xl text-white"
          type="submit"
        >
          Send reset link
        </button>
      </form>
    </>
  );
}

export default ForgotPass;
