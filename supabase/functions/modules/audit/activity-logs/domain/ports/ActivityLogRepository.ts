export type ActivityLogListInput = {
  startDate?: string;
  endDate?: string;
  actionType?: string;
  entityType?: string;
  userId?: string;
  limit: number;
  offset: number;
};

export interface ActivityLogRepository {
  list(input: ActivityLogListInput): Promise<unknown>;
  summary(): Promise<unknown>;
  clear(): Promise<null>;
  create(payload: unknown): Promise<null>;
  actionTypes(): Promise<unknown>;
  entityTypes(): Promise<unknown>;
}
