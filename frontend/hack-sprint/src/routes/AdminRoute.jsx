import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function AdminRoute() {
  const { admin, loading } = useAuthStore();
  if (loading) return null;
  return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default AdminRoute;
