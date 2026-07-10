import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function GuestRoute() {
    const { isAuthenticated, loading } = useAuthStore();
    if (loading) return null;
    return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default GuestRoute;