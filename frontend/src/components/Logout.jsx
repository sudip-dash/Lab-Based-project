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
      localStorage.removeItem('currentlyLoggedIn')
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return <button 
  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
  onClick={handleLogout}>Logout</button>
};

export default Logout;
