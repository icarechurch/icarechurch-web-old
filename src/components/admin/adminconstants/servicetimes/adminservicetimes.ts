import type { ServiceTime } from "@/domains/service-times/model/service-times.types";

/**
 * Initial form state for service time creation/editing
 */
export const INITIAL_FORM_STATE = {
  name: "",
  time: "",
  description: "",
  audience: "",
} as const;

/**
 * Form validation required fields
 */
export const REQUIRED_FIELDS = ["name", "time"] as const;

/**
 * Validates if form has all required fields
 */
export function isFormValid(form: Record<string, string>): boolean {
  return REQUIRED_FIELDS.every((field) => form[field]?.trim());
}

/**
 * Resets form to initial state
 */
export function getResetForm() {
  return { ...INITIAL_FORM_STATE };
}

/**
 * Handles drag start event
 */
export function handleDragStart(id: string): string {
  return id;
}

/**
 * Handles drag over event - prevents default and adds visual feedback
 */
export function handleDragOver(e: React.DragEvent): void {
  e.preventDefault();
  const element = e.currentTarget as HTMLElement;
  element.style.opacity = "0.5";
}

/**
 * Handles drag leave event - removes visual feedback
 */
export function handleDragLeave(e: React.DragEvent): void {
  const element = e.currentTarget as HTMLElement;
  element.style.opacity = "1";
}

/**
 * Swaps items in array based on drag and drop indices
 */
export function swapItems<T extends { id: string }>(
  items: T[],
  draggedId: string,
  targetId: string
): T[] {
  const draggedIdx = items.findIndex((item) => item.id === draggedId);
  const targetIdx = items.findIndex((item) => item.id === targetId);

  if (draggedIdx === -1 || targetIdx === -1) {
    return items;
  }

  const newItems = [...items];
  [newItems[draggedIdx], newItems[targetIdx]] = [
    newItems[targetIdx],
    newItems[draggedIdx],
  ];
  return newItems;
}

/**
 * Prepares sort order updates for database
 */
export function prepareSortOrderUpdates(
  items: ServiceTime[]
): Array<{ id: string; sort_order: number }> {
  return items.map((item, index) => ({
    id: item.id,
    sort_order: index + 1,
  }));
}

/**
 * Determines which items to display based on ordered items state
 */
export function getItemsToDisplay(
  orderedItems: ServiceTime[],
  serviceTimes: ServiceTime[] | undefined
): ServiceTime[] {
  return orderedItems.length > 0 ? orderedItems : serviceTimes || [];
}
