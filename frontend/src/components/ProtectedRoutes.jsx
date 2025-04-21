import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const loggedIn = localStorage.getItem('currentlyLoggedIn')

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;