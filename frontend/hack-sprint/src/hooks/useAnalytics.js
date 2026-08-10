import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// The GA4 tag in index.html loads unconditionally and fires one automatic
// pageview on the initial full page load — but this is a client-side-routed
// SPA, so React Router navigations never reload the page. Without this,
// every route change after the first is invisible to GA: the dashboard
// would show one pageview per session no matter how many pages someone
// actually visited. Restricted to production so local dev traffic doesn't
// pollute real analytics.
export function usePageViewTracking() {
  const location = useLocation();

  useEffect(() => {
    if (!import.meta.env.PROD || typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location]);
}
