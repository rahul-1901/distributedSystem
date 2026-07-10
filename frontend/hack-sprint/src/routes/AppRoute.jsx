import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import AdminRoute from "./AdminRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/signup" element={<div>Signup</div>} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
