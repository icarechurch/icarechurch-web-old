export type EventPopupSettings = {
  event_id: string | null;
  is_enabled: boolean;
};

export interface EventPopupRepository {
  get(): Promise<unknown>;
  upsert(input: EventPopupSettings): Promise<unknown>;
}
