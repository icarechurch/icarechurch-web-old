import { format } from "date-fns";
import {
  Calendar,
  CalendarX,
  CheckCircle,
  Info,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { useEventMutations } from "@/domains/events/hooks/useEventMutations";
import { useEvents } from "@/domains/events/hooks/useEvents";
import type { Event, EventInsert } from "@/domains/events/model/events.types";
import {
  useEventPopupSettings,
  useUpdateEventPopupSettings,
} from "@/hooks/useEventPopup";
import { ImageUpload } from "@/shared/components/media/ImageUpload";
import {
  type EventFormState,
  createDefaultEventForm,
  eventToFormState,
  getErrorMessage,
  getStatusBadgeVariant,
  validateEventForm,
} from "@/admin/events/events.constants";

export function AdminEventsPage() {
  const { data: events, isLoading } = useEvents();
  const { createEvent, updateEvent, deleteEvent } = useEventMutations();
  const { data: popupSettings, isLoading: popupSettingsLoading } =
    useEventPopupSettings();
  const updateEventPopupSettings = useUpdateEventPopupSettings();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<EventFormState>(createDefaultEventForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [popupEnabled, setPopupEnabled] = useState(false);
  const [popupEventId, setPopupEventId] = useState<string>("none");

  useEffect(() => {
    if (!popupSettings) return;

    setPopupEnabled(popupSettings.is_enabled);
    setPopupEventId(popupSettings.event_id ?? "none");
  }, [popupSettings]);

  const hasPopupSettingsChanges = useMemo(() => {
    if (!popupSettings) return false;

    const currentEventId = popupSettings.event_id ?? "none";
    return (
      popupEnabled !== popupSettings.is_enabled || popupEventId !== currentEventId
    );
  }, [popupEnabled, popupEventId, popupSettings]);

  const resetForm = () => {
    setForm(createDefaultEventForm());
    setEditing(null);
  };

  const handleSave = async () => {
    if (!validateEventForm(form)) {
      toast.error("Title and date are required");
      return;
    }
    try {
      if (editing) {
        await updateEvent.mutateAsync({ id: editing.id, ...form });
        toast.success("Event updated");
      } else {
        await createEvent.mutateAsync(form as EventInsert);
        toast.success("Event created");
      }
      setOpen(false);
      resetForm();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEvent.mutateAsync(deleteId);
      toast.success("Deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setForm(eventToFormState(event));
    setOpen(true);
  };

  const handleSavePopupSettings = async () => {
    if (popupEnabled && popupEventId === "none") {
      toast.error("Please select an event before enabling the popup.");
      return;
    }

    try {
      await updateEventPopupSettings.mutateAsync({
        event_id: popupEventId === "none" ? null : popupEventId,
        is_enabled: popupEnabled,
      });
      toast.success("Popup settings updated.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-semibold text-2xl">Events</h2>
        <Dialog
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) resetForm();
          }}
          open={open}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Title *"
                value={form.title}
              />
              <Input
                onChange={(e) =>
                  setForm({ ...form, event_date: e.target.value })
                }
                type="date"
                value={form.event_date}
              />
              <Input
                onChange={(e) =>
                  setForm({ ...form, event_time: e.target.value })
                }
                placeholder="Time (e.g. 7:00 PM)"
                value={form.event_time}
              />
              <Input
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Location"
                value={form.location}
              />
              <div>
                <label className="mb-2 block font-medium text-sm">Status</label>
                <Select
                  onValueChange={(value: "scheduled" | "postponed" | "done") =>
                    setForm({ ...form, status: value })
                  }
                  value={form.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description"
                value={form.description}
              />
              <div>
                <label className="mb-2 block font-medium text-sm">
                  Event Cover Image
                </label>
                <ImageUpload
                  folder="events"
                  onChange={(url) => setForm({ ...form, image_url: url })}
                  value={form.image_url}
                />
              </div>
              <Button className="w-full" onClick={handleSave}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Homepage Event Popup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
            <div>
              <p className="font-medium">Enable popup</p>
              <p className="text-muted-foreground text-sm">
                Show a selected event popup to visitors on the homepage.
              </p>
            </div>
            <Switch checked={popupEnabled} onCheckedChange={setPopupEnabled} />
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm">
              Featured Event
            </label>
            <Select onValueChange={setPopupEventId} value={popupEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No event selected</SelectItem>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} - {format(new Date(event.event_date), "MMM d, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-dashed p-3 text-muted-foreground text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Moderators and admins can update this popup. Visitors can close it,
              and it will stay hidden until the popup content changes.
            </p>
          </div>

          <Button
            disabled={
              popupSettingsLoading ||
              updateEventPopupSettings.isLoading ||
              !hasPopupSettingsChanges
            }
            onClick={handleSavePopupSettings}
          >
            Save Popup Settings
          </Button>
        </CardContent>
      </Card>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {events?.map((e) => (
            <Card className="overflow-hidden" key={e.id}>
              {e.image_url && (
                <div className="h-32 w-full">
                  <img
                    alt={e.title}
                    className="h-full w-full object-cover"
                    src={e.image_url}
                  />
                </div>
              )}
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{e.title}</CardTitle>
                  <Badge
                    className="flex items-center gap-1"
                    variant={getStatusBadgeVariant(e.status)}
                  >
                    {e.status === "done" && <CheckCircle className="h-3 w-3" />}
                    {e.status === "postponed" && (
                      <CalendarX className="h-3 w-3" />
                    )}
                    {e.status === "scheduled" && (
                      <Calendar className="h-3 w-3" />
                    )}
                    {e.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openEdit(e)}
                    size="icon"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(e.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-muted-foreground text-sm">
                <p>
                  {format(new Date(e.event_date), "MMMM d, yyyy")}{" "}
                  {e.event_time && `at ${e.event_time}`}
                </p>
                {e.location && <p>{e.location}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteId(null)}
        open={!!deleteId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
