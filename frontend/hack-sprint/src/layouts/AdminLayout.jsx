import { Outlet } from "react-router-dom";
import React from "react";

function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
