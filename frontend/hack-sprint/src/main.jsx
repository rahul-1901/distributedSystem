import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import AuthProvider from "./providers/AuthProvider.jsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

// Never register in dev — a service worker intercepts and caches the dev
// server's own requests (Vite's HMR client, dependency pre-bundles, etc.),
// which can silently serve stale JS chunks and produce exactly the kind of
// "duplicate React copy" errors and broken HMR this caused before. Only
// ever run this against a real production build.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });

  // The service worker calls skipWaiting()/clients.claim() so a new version
  // activates immediately instead of waiting for every tab to close — this
  // reload is what makes an already-open tab actually pick up the new app
  // shell instead of running stale JS until the next manual navigation.
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
