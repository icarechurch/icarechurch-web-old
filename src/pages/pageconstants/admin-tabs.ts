import type { ComponentType } from "react";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminChurchInfo } from "@/components/admin/AdminChurchInfo";
import { AdminEventsPage } from "@/admin/events/pages/AdminEventsPage";
import { AdminGalleryPage } from "@/admin/gallery/pages/AdminGalleryPage";
import { AdminGivingPage } from "@/admin/giving/pages/AdminGivingPage";
import { AdminLogs } from "@/components/admin/AdminLogs";
import { AdminMinistriesPage } from "@/admin/ministries/pages/AdminMinistriesPage";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { AdminSermonsPage } from "@/admin/sermons/pages/AdminSermonsPage";
import { AdminServiceTimesPage } from "@/admin/service-times/pages/AdminServiceTimesPage";
import { AdminUsers } from "@/components/admin/AdminUsers";

export const TAB_COMPONENTS = {
  analytics: AdminAnalytics,
  ministries: AdminMinistriesPage,
  events: AdminEventsPage,
  sermons: AdminSermonsPage,
  services: AdminServiceTimesPage,
  "church-info": AdminChurchInfo,
  gallery: AdminGalleryPage,
  giving: AdminGivingPage,
  users: AdminUsers,
  logs: AdminLogs,
  profile: AdminProfile,
} satisfies Record<string, ComponentType>;

export type TabKey = keyof typeof TAB_COMPONENTS;
