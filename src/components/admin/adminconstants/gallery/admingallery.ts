// Gallery management constants

export const MAX_GALLERY_IMAGES = 15;

export const GALLERY_STORAGE_BUCKET = "gallery" as const;

// UI Text Constants
export const UI_TEXT = {
  title: "Gallery Management",
  subtitle: "Manage your church photo gallery",
  limitReached: {
    title: "Limit Reached",
    description: `You can only upload up to ${MAX_GALLERY_IMAGES} images to the gallery.`,
  },
  uploadSuccess: {
    title: "Success",
    description: "Image uploaded successfully",
  },
  uploadError: {
    title: "Error",
    description: "Failed to upload image. Please try again.",
  },
  deleteSuccess: {
    title: "Deleted",
    description: "Image removed from gallery",
  },
  deleteError: {
    title: "Error",
    description: "Failed to delete image",
  },
  addButton: "Add Image",
  loading: "Loading gallery...",
  dialogTitle: "Add New Image",
  emptyState: {
    heading: "No images yet",
    description: "Upload photos to showcase your church community",
  },
} as const;

// Form Field Labels
export const FORM_LABELS = {
  title: "Title",
  titlePlaceholder: "e.g., Sunday Worship",
  description: "Description (Optional)",
  descriptionPlaceholder: "Brief description of the photo",
  imageFile: "Image File",
  uploadButton: "Upload",
  uploadingButton: "Uploading...",
  deleteButton: "Delete",
} as const;

/**
 * Calculates remaining gallery slots
 */
export function getRemainingSlots(currentImageCount: number): number {
  return MAX_GALLERY_IMAGES - currentImageCount;
}

/**
 * Checks if gallery is at capacity
 */
export function isGalleryFull(currentImageCount: number): boolean {
  return currentImageCount >= MAX_GALLERY_IMAGES;
}

/**
 * Gets dialog description with remaining slots
 */
export function getDialogDescription(currentImageCount: number): string {
  const remaining = getRemainingSlots(currentImageCount);
  return `Upload a new photo to the gallery. ${remaining} slots remaining.`;
}

/**
 * Gets subtitle with image count
 */
export function getSubtitle(currentImageCount: number): string {
  return `${UI_TEXT.subtitle} (Max ${MAX_GALLERY_IMAGES} images)`;
}
