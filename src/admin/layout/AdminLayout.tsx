import type { ReactNode } from "react";
import { SidebarProvider } from "@/shared/components/ui/sidebar";

export function AdminLayout({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
