import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageVisit } from "@/hooks/useAnalytics";

export function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to the top when the location changes
    window.scrollTo(0, 0);

    // Track the page visit when the location changes
    trackPageVisit(location.pathname);
  }, [location.pathname]);

  // This component renders nothing
  return null;
}
