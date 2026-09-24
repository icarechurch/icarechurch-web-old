import { type ReactNode, useEffect, useState } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  hideNavbarUntilSection?: string;
}

export function Layout({ children, hideNavbarUntilSection }: LayoutProps) {
  const [isNavbarVisible, setIsNavbarVisible] = useState(!hideNavbarUntilSection);

  useEffect(() => {
    if (!hideNavbarUntilSection) {
      setIsNavbarVisible(true);
      return;
    }

    const handleScroll = () => {
      const section = document.getElementById(hideNavbarUntilSection);
      if (section) {
        const sectionTop = section.getBoundingClientRect().top;
        // Show navbar when section reaches the top of the viewport (or slightly before)
        setIsNavbarVisible(sectionTop <= 100);
      }
    };

    // Check initial position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideNavbarUntilSection]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isVisible={isNavbarVisible} />
      <main className={`flex-1 ${!hideNavbarUntilSection ? 'pt-16' : ''}`}>{children}</main>
      <Footer />
    </div>
  );
}
