import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes/AppRoute";
import React from 'react';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <ToastContainer position="top-right" style={{ zIndex: 100000 }} />
      <AppRoutes />
    </>
  );
}

export default App;
