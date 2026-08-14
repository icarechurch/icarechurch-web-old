import type { CSSProperties, ReactNode } from "react";
import { SidebarProvider } from "@/shared/components/ui/sidebar";

export function AdminLayout({ children }: { children: ReactNode }) {
  const sidebarStyle = { "--sidebar-width": "24rem" } as CSSProperties;

  return <SidebarProvider style={sidebarStyle}>{children}</SidebarProvider>;
}
