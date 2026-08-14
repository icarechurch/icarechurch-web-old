import { endOfMonth, startOfMonth, subMonths } from "date-fns";
export const ITEMS_PER_PAGE = 20;
// Preset date ranges for quick filtering
interface DatePreset {
  readonly label: string;
  readonly getValue: () => { readonly start: Date; readonly end: Date };
}

export const DATE_PRESETS: readonly DatePreset[] = [
  {
    label: "Today",
    getValue: () => ({ start: new Date(), end: new Date() }),
  },
  {
    label: "Last 7 days",
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start, end };
    },
  },
  {
    label: "Last 30 days",
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start, end };
    },
  },
  {
    label: "This month",
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last month",
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 1)),
      end: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: "Last 3 months",
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 2)),
      end: new Date(),
    }),
  },
] as const;

/**
 * Formats an action type string to a human-readable format
 * @example "user_created" -> "User Created"
 */
export function formatActionType(actionType: string): string {
  return actionType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
