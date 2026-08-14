import type { Pastor, PastorInsert } from "@/domains/sermons/hooks/useSermons";

/**
 * Default empty church info form state
 */
export const DEFAULT_CHURCH_INFO_FORM = {
  church_name: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  office_hours: "",
  fallback_stream_url: "",
} as const;

/**
 * Creates default pastor form state with optional sort order
 */
export function createDefaultPastorForm(sortOrder = 0): PastorInsert {
  return {
    name: "",
    email: "",
    phone: "",
    title: "Pastor",
    bio: "",
    image_url: "",
    facebook_url: "",
    sort_order: sortOrder,
  };
}

/**
 * Converts a Pastor entity to a PastorInsert form state
 */
export function pastorToFormState(pastor: Pastor): PastorInsert {
  return {
    name: pastor.name,
    email: pastor.email || "",
    phone: pastor.phone || "",
    title: pastor.title || "Pastor",
    bio: pastor.bio || "",
    image_url: pastor.image_url || "",
    facebook_url: pastor.facebook_url || "",
    sort_order: pastor.sort_order || 0,
  };
}

/**
 * Gets the first letter of a name for avatar display
 */
export function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

/**
 * Extracts error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An error occurred";
}
