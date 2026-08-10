import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoute";
import InstallPrompt from "./components/InstallPrompt.jsx";
import Chatbot from "./components/Chatbot.jsx";
import { usePageViewTracking } from "./hooks/useAnalytics.js";
import React from 'react';

function App() {
  usePageViewTracking();

  return (
    <>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 100000 }}
        toastOptions={{ style: { zIndex: 100000 } }}
      />
      <AppRoutes />
      <Chatbot />
      <InstallPrompt />
    </>
  );
}

export default App;
