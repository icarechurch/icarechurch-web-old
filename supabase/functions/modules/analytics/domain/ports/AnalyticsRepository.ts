export type AnalyticsOverviewInput = {
  daysBack?: unknown;
  recentLimit?: unknown;
};

export type AnalyticsOverview = {
  summary: Record<string, unknown> | null;
  dailyVisits: Array<Record<string, unknown>>;
  pagePopularity: Array<Record<string, unknown>>;
  recentVisits: Array<Record<string, unknown>>;
  contentAnalytics: Record<string, unknown> | null;
};

export interface AnalyticsRepository {
  trackVisit(payload: unknown): Promise<null>;
  summary(input: { daysBack: unknown }): Promise<unknown>;
  dailyVisits(input: { daysBack: unknown }): Promise<unknown>;
  pagePopularity(input: { daysBack: unknown }): Promise<unknown>;
  recentVisits(input: { limit: unknown }): Promise<unknown>;
  content(): Promise<unknown>;
  overview(input: AnalyticsOverviewInput): Promise<AnalyticsOverview>;
}
