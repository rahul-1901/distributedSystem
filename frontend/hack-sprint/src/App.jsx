import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoute";
import React from 'react';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { zIndex: 100000 } }} />
      <AppRoutes />
    </>
  );
}

export default App;
