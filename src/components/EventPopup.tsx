import { format } from "date-fns";
import { Calendar, Clock, Image as ImageIcon, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "@/hooks/useChurchData";
import { useEventPopupSettings } from "@/hooks/useEventPopup";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const DISMISS_STORAGE_KEY = "icc:event-popup:dismissed-version";

export function EventPopup() {
  const { data: popupSettings, isLoading: popupLoading } = useEventPopupSettings();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const [open, setOpen] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const selectedEvent = useMemo(() => {
    if (!popupSettings?.event_id || !events) return null;
    return events.find((event) => event.id === popupSettings.event_id) ?? null;
  }, [events, popupSettings?.event_id]);

  const popupVersion = popupSettings
    ? `${popupSettings.id}:${popupSettings.updated_at}`
    : "";
  const coverImageUrl = selectedEvent?.image_url?.trim() ?? "";
  const hasCoverImage = coverImageUrl.length > 0 && !imageLoadFailed;
  const closeButtonClass = hasCoverImage
    ? "[&>button]:top-3 [&>button]:right-3 [&>button]:h-9 [&>button]:w-9 [&>button]:rounded-full [&>button]:border [&>button]:border-white/80 [&>button]:text-white [&>button]:opacity-100 [&>button]:shadow-lg [&>button]:backdrop-blur-sm [&>button[data-state=open]]:bg-black/65 [&>button[data-state=open]]:text-white [&>button:hover]:bg-black/80 [&>button]:focus-visible:ring-2 [&>button]:focus-visible:ring-white [&>button]:focus-visible:ring-offset-0"
    : "[&>button]:top-3 [&>button]:right-3 [&>button]:h-9 [&>button]:w-9 [&>button]:rounded-full [&>button]:border [&>button]:border-border [&>button]:text-foreground [&>button]:opacity-100 [&>button]:shadow-sm [&>button[data-state=open]]:bg-background [&>button:hover]:bg-muted";

  useEffect(() => {
    if (popupLoading || eventsLoading) return;

    if (!popupSettings?.is_enabled || !selectedEvent || !popupVersion) {
      setOpen(false);
      return;
    }

    if (typeof window === "undefined") return;
    const dismissedVersion = window.sessionStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedVersion === popupVersion) return;

    setOpen(true);
  }, [
    eventsLoading,
    popupLoading,
    popupSettings?.is_enabled,
    popupVersion,
    selectedEvent,
  ]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen && popupVersion && typeof window !== "undefined") {
      window.sessionStorage.setItem(DISMISS_STORAGE_KEY, popupVersion);
    }
  };

  useEffect(() => {
    setImageLoadFailed(false);
  }, [selectedEvent?.id, selectedEvent?.image_url]);

  if (!popupSettings?.is_enabled || !selectedEvent) return null;

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        className={
          hasCoverImage
            ? `overflow-hidden p-0 sm:max-w-2xl ${closeButtonClass}`
            : `max-h-[92vh] overflow-y-auto sm:max-w-lg ${closeButtonClass}`
        }
      >
        {hasCoverImage ? (
          <div className="overflow-hidden rounded-lg">
            <img
              alt={`${selectedEvent.title} cover`}
              className="max-h-[90vh] w-full object-cover"
              onError={() => setImageLoadFailed(true)}
              src={coverImageUrl}
            />
          </div>
        ) : (
          <>
            <div className="-mx-6 -mt-6 flex h-40 items-center justify-center rounded-t-lg border-b bg-secondary/30 text-muted-foreground">
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4" />
                No cover image available
              </div>
            </div>

            <DialogHeader>
              <div className="mb-2">
                <Badge variant="secondary">Church Event</Badge>
              </div>
              <DialogTitle className="font-display text-2xl">
                {selectedEvent.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-muted-foreground text-sm">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                {format(new Date(selectedEvent.event_date), "EEEE, MMMM d, yyyy")}
              </p>
              {selectedEvent.event_time && (
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  {selectedEvent.event_time}
                </p>
              )}
              {selectedEvent.location && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {selectedEvent.location}
                </p>
              )}
              {selectedEvent.description && (
                <p className="pt-1 leading-relaxed">{selectedEvent.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button onClick={() => handleOpenChange(false)} variant="outline">
                Close
              </Button>
              <Button asChild>
                <Link
                  onClick={() => handleOpenChange(false)}
                  to="/events"
                >
                  View Events
                </Link>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
