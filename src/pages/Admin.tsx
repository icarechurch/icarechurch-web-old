import { useState } from "react";
import { TabGuard } from "@/pages/auth/TabGuard";
import { TAB_COMPONENTS, type TabKey } from "@/pages/pageconstants/admin-tabs";
import { Navigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export default function Admin() {
  const { isAdmin, loading, role } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("analytics");

  // Enable real-time updates for all admin data
  useRealtimeSubscription();

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  // Redirect moderators to the specific moderator dashboard
  if (role === "moderator") return <Navigate replace to="/moderator" />;

  if (!isAdmin) return <Navigate replace to="/auth" />;

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
    >
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center border-b p-4 md:hidden">
            <SidebarTrigger className="mr-4" />
            <h1 className="font-bold font-display text-xl">Admin</h1>
          </div>
          <div className="flex-1 overflow-x-hidden p-4 md:p-8">
            <h1 className="mb-8 hidden font-bold font-display text-3xl md:block">
              Admin Dashboard
            </h1>

            <TabGuard tab={activeTab}>
              <ActiveComponent />
            </TabGuard>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
