import { type ReactNode, useEffect, useState } from "react";
import { authService } from "@/integrations/supabase/services";

interface TabGuardProps {
  tab: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Fetches the allowed tabs for the current user from the backend and either
 * renders `children` (allowed) or `fallback` / a default denial message.
 *
 * No access logic lives here — the source of truth is the Supabase function
 * `get_allowed_tabs()` which evaluates the caller's role server-side.
 * 
 * This also removes all of the access control logic on the client-side, thus removing more
 * possible vulnerabilities on the website.
 */
export function TabGuard({ tab, children, fallback }: TabGuardProps) {
  const [allowedTabs, setAllowedTabs] = useState<string[] | null>(null);

  useEffect(() => {
    authService.getAllowedTabs().then(setAllowedTabs);
  }, []);

  if (allowedTabs === null) return null;

  if (!allowedTabs.includes(tab)) {
    return (
      fallback ?? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Access Denied
        </div>
      )
    );
  }

  return <>{children}</>;
}
