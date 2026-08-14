import type { ComponentType } from "react";
import { AdminAnalyticsPage } from "@/admin/analytics/pages/AdminAnalyticsPage";
import { AdminChurchInfoPage } from "@/admin/church-info/pages/AdminChurchInfoPage";
import { AdminEventsPage } from "@/admin/events/pages/AdminEventsPage";
import { AdminGalleryPage } from "@/admin/gallery/pages/AdminGalleryPage";
import { AdminGivingPage } from "@/admin/giving/pages/AdminGivingPage";
import { AdminLogsPage } from "@/admin/activity-logs/pages/AdminLogsPage";
import { AdminMinistriesPage } from "@/admin/ministries/pages/AdminMinistriesPage";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { AdminSermonsPage } from "@/admin/sermons/pages/AdminSermonsPage";
import { AdminServiceTimesPage } from "@/admin/service-times/pages/AdminServiceTimesPage";
import { AdminUsersPage } from "@/admin/users/pages/AdminUsersPage";

export const TAB_COMPONENTS = {
  analytics: AdminAnalyticsPage,
  ministries: AdminMinistriesPage,
  events: AdminEventsPage,
  sermons: AdminSermonsPage,
  services: AdminServiceTimesPage,
  "church-info": AdminChurchInfoPage,
  gallery: AdminGalleryPage,
  giving: AdminGivingPage,
  users: AdminUsersPage,
  logs: AdminLogsPage,
  profile: AdminProfile,
} satisfies Record<string, ComponentType>;

export type TabKey = keyof typeof TAB_COMPONENTS;
