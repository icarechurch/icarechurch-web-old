import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there is a hash, try to scroll to the element
    if (hash) {
      // Use a small timeout to ensure the DOM is ready (simpler than MutationObserver for this use case)
      const timer = setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // 100ms delay to allow component mounting

      return () => clearTimeout(timer);
    }
    // Otherwise, scroll to top on route change

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
