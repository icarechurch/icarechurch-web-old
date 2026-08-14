import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AdminDashboardContent } from "@/admin/dashboard/AdminDashboardContent";
import { AdminLayout } from "@/admin/layout/AdminLayout";
import { type TabKey } from "@/admin/layout/admin-tabs";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export default function AdminDashboardPage() {
  const { isAdmin, loading, role } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("analytics");
  useRealtimeSubscription();

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (role === "moderator") return <Navigate replace to="/moderator" />;
  if (!isAdmin) return <Navigate replace to="/auth" />;

  return <AdminLayout><AdminDashboardContent activeTab={activeTab} setActiveTab={setActiveTab} /></AdminLayout>;
}
