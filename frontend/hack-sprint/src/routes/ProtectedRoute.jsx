import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuthStore();
  if (loading) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
