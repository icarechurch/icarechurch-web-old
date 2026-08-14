import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { AdminGallery } from "@/components/admin/AdminGallery";
import { AdminMinistries } from "@/components/admin/AdminMinistries";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { AdminSermons } from "@/components/admin/AdminSermons";
import { ModeratorAnalytics } from "@/components/moderator/ModeratorAnalytics";
import { ModeratorSidebar } from "@/components/moderator/ModeratorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export default function Moderator() {
  const { isModerator, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");

  // Enable real-time updates for all moderator data
  useRealtimeSubscription();

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  // Only allow moderators (admins can technically access if they want, but usually they use /admin)
  // If strict separation is desired: if (!isModerator) ...
  // But usually Admins should be able to see everything.
  // However, the user asked for a SEPARATE dashboard.
  // So if not a moderator (and not an admin who might want to see it?), redirect.
  // Let's assume only moderators and admins can see this, but it's designed for moderators.
  if (!(isModerator || isAdmin)) return <Navigate replace to="/auth" />;

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
    >
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <ModeratorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center border-b p-4 md:hidden">
            <SidebarTrigger className="mr-4" />
            <h1 className="font-bold font-display text-xl">Moderator</h1>
          </div>
          <div className="flex-1 overflow-x-hidden p-4 md:p-8">
            <h1 className="mb-8 hidden font-bold font-display text-3xl md:block">
              Moderator Dashboard
            </h1>

            {activeTab === "analytics" && <ModeratorAnalytics />}
            {activeTab === "events" && <AdminEvents />}
            {activeTab === "sermons" && <AdminSermons />}
            {activeTab === "ministries" && <AdminMinistries />}
            {activeTab === "gallery" && <AdminGallery />}
            {activeTab === "profile" && <AdminProfile />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
