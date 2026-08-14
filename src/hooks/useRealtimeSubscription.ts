import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Tables that should have real-time subscriptions
const REALTIME_TABLES = [
  { table: "events", queryKey: "events" },
  { table: "ministries", queryKey: "ministries" },
  { table: "sermons", queryKey: "sermons" },
  { table: "gallery_images", queryKey: "gallery" },
  { table: "service_times", queryKey: "service_times" },
  { table: "church_info", queryKey: "church_info" },
  { table: "event_popup_settings", queryKey: "event-popup-settings" },
] as const;

/**
 * Hook that subscribes to Supabase real-time changes for admin/moderator tables.
 * When changes occur, it dispatches window events to trigger query refetches.
 */
export function useRealtimeSubscription() {
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    // Subscribe to each table
    const channels = REALTIME_TABLES.map(({ table, queryKey }) => {
      const channel = supabase
        .channel(`realtime-${table}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to INSERT, UPDATE, DELETE
            schema: "public",
            table,
          },
          (payload) => {
            // Dispatch event to invalidate the query
            // Dispatch event to invalidate the query
            window.dispatchEvent(new Event(`invalidate-${queryKey}`));

            // For sermons, also invalidate latest_sermon
            if (table === "sermons") {
              window.dispatchEvent(new Event("invalidate-latest_sermon"));
            }
          }
        )
        .subscribe((_status) => {
          // Subscription status handled silently
        });

      return channel;
    });

    channelsRef.current = channels;

    // Cleanup on unmount
    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return null;
}
