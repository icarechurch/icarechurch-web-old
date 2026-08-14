import type { ReactNode } from "react";
import { AuthProvider } from "@/domains/auth/providers/AuthProvider";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        {children}
      </AuthProvider>
    </TooltipProvider>
  );
}
