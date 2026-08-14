import type { ComponentType } from "react";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminChurchInfo } from "@/components/admin/AdminChurchInfo";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { AdminGallery } from "@/components/admin/AdminGallery";
import { AdminGiving } from "@/components/admin/AdminGiving";
import { AdminLogs } from "@/components/admin/AdminLogs";
import { AdminMinistries } from "@/components/admin/AdminMinistries";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { AdminSermons } from "@/components/admin/AdminSermons";
import { AdminServiceTimes } from "@/components/admin/AdminServiceTimes";
import { AdminUsers } from "@/components/admin/AdminUsers";

export const TAB_COMPONENTS = {
  analytics: AdminAnalytics,
  ministries: AdminMinistries,
  events: AdminEvents,
  sermons: AdminSermons,
  services: AdminServiceTimes,
  "church-info": AdminChurchInfo,
  gallery: AdminGallery,
  giving: AdminGiving,
  users: AdminUsers,
  logs: AdminLogs,
  profile: AdminProfile,
} satisfies Record<string, ComponentType>;

export type TabKey = keyof typeof TAB_COMPONENTS;
