import { Outlet } from "react-router-dom";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function AdminLayout() {
  return (
    <>
      <Navbar variant="admin" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default AdminLayout;
