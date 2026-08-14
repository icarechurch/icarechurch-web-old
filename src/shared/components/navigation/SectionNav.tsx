import { useLocation } from "react-router-dom";

interface SectionNavProps {
  sections: {
    id: string;
    label: string;
  }[];
}

export function SectionNav({ sections }: SectionNavProps) {
  const location = useLocation();

  // Only show on specific pages where sections exist
  const showSectionNav = [
    "/",
    "/about",
    "/services",
    "/events",
    "/ministries",
  ].includes(location.pathname);

  if (!showSectionNav) return null;

  const handleClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-2">
          {sections.map((section) => (
            <button
              className="whitespace-nowrap rounded-md px-4 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-secondary hover:text-foreground"
              key={section.id}
              onClick={() => handleClick(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
