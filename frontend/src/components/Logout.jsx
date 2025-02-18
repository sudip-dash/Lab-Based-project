import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/logout",
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          }, // Ensure token is sent
        }
      );

      console.log(response.data);
      localStorage.removeItem("accessToken");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return <button className="border-black p-2 m-2 bg-red-700 rounded-2xl text-white" onClick={handleLogout}>Logout</button>;
};

export default Logout;
