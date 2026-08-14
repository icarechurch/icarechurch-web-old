import { TabGuard } from "@/admin/layout/TabGuard";
import { TAB_COMPONENTS, type TabKey } from "@/admin/layout/admin-tabs";
import { AdminSidebar } from "@/admin/layout/AdminSidebar";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

export function AdminDashboardContent({ activeTab, setActiveTab }: { activeTab: TabKey; setActiveTab: (tab: TabKey) => void }) {
  const ActiveComponent = TAB_COMPONENTS[activeTab];
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center border-b p-4 md:hidden">
          <SidebarTrigger className="mr-4" />
          <h1 className="font-bold font-display text-xl">Admin</h1>
        </div>
        <div className="flex-1 overflow-x-hidden p-4 md:p-8">
          <h1 className="mb-8 hidden font-bold font-display text-3xl md:block">Admin Dashboard</h1>
          <TabGuard tab={activeTab}><ActiveComponent /></TabGuard>
        </div>
      </main>
    </div>
  );
}
