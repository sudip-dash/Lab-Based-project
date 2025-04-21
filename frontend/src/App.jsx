import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import Logout from "./components/Logout.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import ForgotPass from "./components/ForgotPass.jsx";
import FileUploader from "./components/FileUploader.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route
            path="/reset-password/:resetToken"
            element={<ResetPassword />}
          />
          <Route path="/upload" element={<FileUploader />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
