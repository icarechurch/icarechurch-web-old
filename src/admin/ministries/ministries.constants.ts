// Ministry categories
export const MINISTRY_CATEGORIES = {
  MINISTRY: "ministry",
  OUTREACH: "outreach",
} as const;

export type MinistryCategory = typeof MINISTRY_CATEGORIES[keyof typeof MINISTRY_CATEGORIES];

// Category display labels
export const CATEGORY_LABELS: Record<MinistryCategory, string> = {
  ministry: "Church Ministry",
  outreach: "Outreach",
} as const;

// Section titles
export const SECTION_TITLES = {
  MAIN_TITLE: "Ministries & Outreaches",
  MAIN_DESCRIPTION: "Manage your church ministries and outreach programs",
  CHURCH_MINISTRIES: "Church Ministries",
  OUTREACHES: "Outreaches",
} as const;

// Form field placeholders and labels
export const FORM_FIELDS = {
  NAME_PLACEHOLDER: "Name *",
  DESCRIPTION_PLACEHOLDER: "Description",
  LEADER_PLACEHOLDER: "Leader",
  MEETING_TIME_PLACEHOLDER: "Meeting Time",
  CATEGORY_LABEL: "Category",
  IMAGE_LABEL: "Image",
  DIALOG_TITLE_ADD: "Add Entry",
  DIALOG_TITLE_EDIT: "Edit Entry",
} as const;

// Card labels
export const CARD_LABELS = {
  LEADER: "Leader",
  SCHEDULE: "Schedule",
} as const;

// Empty state messages
export const EMPTY_STATES = {
  NO_CHURCH_MINISTRIES: "No church ministries yet.",
  NO_OUTREACHES: "No outreaches yet.",
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  NAME_REQUIRED: "Name is required",
  CREATED_SUCCESS: "Created successfully",
  UPDATED_SUCCESS: "Updated successfully",
  DELETED_SUCCESS: "Deleted",
  ERROR_DEFAULT: "An error occurred",
} as const;

// Confirmation dialog
export const DELETE_CONFIRMATION = {
  TITLE: "Are you absolutely sure?",
  DESCRIPTION: "This action cannot be undone. This will permanently delete the ministry/outreach.",
  CANCEL: "Cancel",
  DELETE: "Delete",
} as const;

// Image upload
export const IMAGE_UPLOAD_CONFIG = {
  FOLDER: "ministries",
} as const;

// Default form state
export const DEFAULT_FORM_STATE = {
  name: "",
  description: "",
  leader: "",
  meeting_time: "",
  image_url: "",
  category: MINISTRY_CATEGORIES.MINISTRY as MinistryCategory,
} as const;
