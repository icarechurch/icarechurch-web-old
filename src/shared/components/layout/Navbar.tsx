import { Menu, Settings, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/shared/components/ui/navigation-menu";
import { useAuth } from "@/domains/auth/hooks/useAuth";

const navLinks = [
  {
    href: "/",
    label: "Home",
    subLinks: [
      { href: "/", label: "Welcome" },
      { href: "/#about", label: "About Us" },
      { href: "/#care", label: "C.A.R.E." },
    ],
  },
  {
    href: "/about",
    label: "About",
    subLinks: [
      { href: "/about#story", label: "Our Story" },
      { href: "/about#mission", label: "Mission & Vision" },
      { href: "/about#values", label: "Core Values" },
      { href: "/about#pastor", label: "Leadership" },
    ],
  },
  {
    href: "/services",
    label: "Services",
    subLinks: [
      { href: "/services#service-times", label: "Service Times" },
      { href: "/services#expect", label: "What to Expect" },
      { href: "/services#location", label: "Location" },
    ],
  },
  {
    href: "/ministries",
    label: "Ministries",
    subLinks: [
      { href: "/ministries", label: "All Ministries" },
      { href: "/ministries#church-ministries", label: "Church Ministries" },
      { href: "/ministries#outreaches", label: "Outreaches" },
    ],
  },
  {
    href: "/events",
    label: "Events",
    subLinks: [
      { href: "/events#events-list", label: "Upcoming Events" },
      { href: "/events#newsletter", label: "Stay Updated" },
    ],
  },
  {
    href: "/sermons",
    label: "Sermons",
    subLinks: [
      { href: "/sermons#sermons-list", label: "Latest Sermons" },
      { href: "/sermons#livestream", label: "Watch Live" },
    ],
  },
  {
    href: "/gallery",
    label: "Gallery",
    subLinks: [{ href: "/gallery#gallery-grid", label: "Photo Gallery" }],
  },
  {
    href: "/giving",
    label: "Giving",
    subLinks: [{ href: "/giving#ways-to-give", label: "Ways to Give" }],
  },
  {
    href: "/contact",
    label: "Contact",
    subLinks: [
      { href: "/contact", label: "Get in Touch" },
      { href: "/contact#contact-info", label: "Contact Info" },
    ],
  },
];

interface NavbarProps {
  isVisible?: boolean;
}

export function Navbar({ isVisible = true }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isModerator } = useAuth();

  const isNavLinkActive = (href: string) =>
    href === "/"
      ? location.pathname === href
      : location.pathname.startsWith(href);

  const handleParentClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    navigate(href);
    window.scrollTo(0, 0);
  };

  const handleSubLinkClick = (href: string) => {
    setIsOpen(false);
    const [path, hash] = href.split("#");
    if (hash) {
      // If we're already on the same page, just scroll to the element
      if (
        location.pathname === path ||
        (path === "" && location.pathname === "/")
      ) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        // If navigating to a different page, navigate first then scroll after page loads
        navigate(href);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 300);
      }
    }
  };

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 right-0 left-0 z-50 border-b bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/60 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
    >
      <div className="container mx-auto px-4">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex flex-1 justify-start">
            <Link
              aria-label="Go to homepage"
              className="flex items-center space-x-2"
              to="/"
            >
              <img
                alt="REFUGE Logo"
                className="h-10 w-auto"
                src="/icc logo no bg.png"
              />
            </Link>
          </div>

          {/* Desktop Nav - Centered */}
          <div className="hidden items-center space-x-1 2xl:flex">
            {navLinks.map((link) => (
              <NavigationMenu className="list-none" key={link.href}>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    {link.subLinks ? (
                      <>
                        <NavigationMenuTrigger
                          className={`bg-transparent ${isNavLinkActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                          onClick={(e) => handleParentClick(e, link.href)}
                        >
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[200px] gap-2 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
                            {link.subLinks.map((subLink) => (
                              <li key={subLink.href}>
                                <Link
                                  className="block rounded-md p-2 font-medium text-sm hover:bg-muted"
                                  onClick={(e) => {
                                    if (subLink.href.includes("#")) {
                                      e.preventDefault();
                                      handleSubLinkClick(subLink.href);
                                    }
                                  }}
                                  to={subLink.href}
                                >
                                  {subLink.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link to={link.href}>
                        <NavigationMenuLink
                          className={
                            navigationMenuTriggerStyle() +
                            `bg-transparent ${isNavLinkActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                          }
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </Link>
                    )}
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex flex-1 items-center justify-end space-x-2">
            {(isAdmin || isModerator) && (
              <Link to="/admin">
                <Button className="hidden 2xl:flex" size="sm" variant="ghost">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
            {user && !isAdmin && !isModerator && (
              <Link to="/profile">
                <Button className="hidden 2xl:flex" size="sm" variant="ghost">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
            )}
            {!user && (
              <Link to="/auth">
                <Button className="hidden 2xl:flex" size="sm" variant="ghost">
                  Login
                </Button>
              </Link>
            )}
            <Link to="/contact">
              <Button className="hidden 2xl:flex" size="sm">
                Plan Your Visit
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              aria-controls="mobile-site-menu"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="2xl:hidden"
              onClick={() => setIsOpen(!isOpen)}
              size="icon"
              variant="ghost"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div
            className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t py-4 2xl:hidden"
            id="mobile-site-menu"
          >
            <div className="flex flex-col space-y-2 px-4">
              <Accordion className="w-full" collapsible type="single">
                {navLinks.map((link) =>
                  link.subLinks ? (
                    <AccordionItem
                      className="border-b-0"
                      key={link.label}
                      value={link.label}
                    >
                      <AccordionTrigger className="py-2 font-medium text-base hover:no-underline">
                        {link.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="flex flex-col space-y-2 pl-4">
                          {link.subLinks.map((subLink) => (
                            <li key={subLink.href}>
                              <Link
                                className="block py-2 text-muted-foreground text-sm hover:text-foreground"
                                onClick={(e) => {
                                  if (subLink.href.includes("#")) {
                                    e.preventDefault();
                                    handleSubLinkClick(subLink.href);
                                  } else {
                                    setIsOpen(false);
                                  }
                                }}
                                to={subLink.href}
                              >
                                {subLink.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <div className="py-2" key={link.href}>
                      <Link
                        className={`flex flex-1 items-center justify-between py-2 font-medium text-base transition-all hover:underline ${
                          location.pathname === link.href
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                        onClick={() => setIsOpen(false)}
                        to={link.href}
                      >
                        {link.label}
                      </Link>
                    </div>
                  )
                )}
              </Accordion>

              {(isAdmin || isModerator) && (
                <Link
                  className="flex items-center px-0 py-4 font-medium text-base text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                  to="/admin"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}
              {user && !isAdmin && !isModerator && (
                <Link
                  className="flex items-center px-0 py-4 font-medium text-base text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                  to="/profile"
                >
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
              )}
              {!user && (
                <Link
                  className="px-0 py-2 font-medium text-base text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                  to="/auth"
                >
                  Login
                </Link>
              )}
              <Link onClick={() => setIsOpen(false)} to="/contact">
                <Button className="mt-4 w-full" size="sm">
                  Plan Your Visit
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
