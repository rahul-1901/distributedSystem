import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
