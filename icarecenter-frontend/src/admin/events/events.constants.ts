import type { Event } from "@/domains/events/model/events.types";

export interface EventFormState {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  status: "scheduled" | "postponed" | "done";
}

export const DEFAULT_EVENT_FORM: EventFormState = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  location: "",
  image_url: "",
  status: "scheduled",
};

export function createDefaultEventForm(): EventFormState {
  return { ...DEFAULT_EVENT_FORM };
}

export function eventToFormState(event: Event): EventFormState {
  return {
    title: event.title,
    description: event.description || "",
    event_date: event.event_date,
    event_time: event.event_time || "",
    location: event.location || "",
    image_url: event.image_url || "",
    status: event.status || "scheduled",
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An error occurred";
}

export function getStatusBadgeVariant(
  status?: "scheduled" | "postponed" | "done"
): "default" | "destructive" | "secondary" {
  switch (status) {
    case "done":
      return "default";
    case "postponed":
      return "destructive";
    default:
      return "secondary";
  }
}

export function validateEventForm(form: EventFormState): boolean {
  return !!(form.title && form.event_date);
}
