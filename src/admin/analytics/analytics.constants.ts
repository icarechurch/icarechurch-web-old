import type { format } from "date-fns";

// Chart colors for data visualization
export const CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
] as const;

// Page path mappings for display names
export const PAGE_MAPPINGS: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/ministries": "Ministries",
  "/services": "Services",
  "/events": "Events",
  "/contact": "Contact",
  "/auth": "Authentication",
  "/admin": "Admin Dashboard",
  "/moderator": "Moderator Dashboard",
} as const;

/**
 * Converts a page path to a human-readable display name
 */
export function formatPagePath(path: string): string {
  return PAGE_MAPPINGS[path] || path;
}

/**
 * Formats chart data by converting dates to readable format
 */
export function formatChartData(
  data: Array<{ date: string; [key: string]: unknown }>,
  formatFn: typeof format
): Array<{ date: string; [key: string]: unknown }> {
  return (
    data?.map((item) => ({
      ...item,
      date: formatFn(new Date(item.date), "MMM dd"),
    })) || []
  );
}

/**
 * Creates pie chart data from page popularity data
 */
export function createPieChartData(
  pagePopularity: Array<{ page_path: string; total_visits: number }> | undefined,
  maxItems = 6
): Array<{ name: string; value: number; color: string }> {
  return (
    pagePopularity?.slice(0, maxItems).map((page, index) => ({
      name: formatPagePath(page.page_path),
      value: page.total_visits,
      color: CHART_COLORS[index % CHART_COLORS.length],
    })) || []
  );
}
