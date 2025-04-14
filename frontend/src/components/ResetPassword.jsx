import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
    const { resetToken } = useParams(); // Ensure it matches backend param name
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();
  
    const handleResetPassword = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(
          `http://localhost:8000/user/reset-password/${resetToken}`, // Send token in URL
          { newPassword } // Send only newPassword in body
        );
  
        console.log("✅ Password reset successful:", response.data.message);
        alert("Password reset successful! You can now log in.");
        navigate("/login");
      } catch (error) {
        console.error(
          "❌ Error resetting password:",
          error.response?.data || error
        );
        alert(
          error.response?.data?.message || "Error resetting password. Try again."
        );
      }
    };
  
    return (
      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    );
  };
  
  export default ResetPassword;

  