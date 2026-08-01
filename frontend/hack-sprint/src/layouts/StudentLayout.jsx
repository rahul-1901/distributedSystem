import { Outlet } from "react-router-dom";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function StudentLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default StudentLayout;
