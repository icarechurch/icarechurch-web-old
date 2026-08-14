import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../client";
import { activityLogsService } from "./activity-logs.service";

vi.mock("../client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const invoke = vi.mocked(supabase.functions.invoke);

describe("activity logs service adapters", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("loads filtered logs through the activity-logs function", async () => {
    const result = { logs: [], totalCount: 0 };
    const input = {
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-01-31T23:59:59.999Z",
      actionType: "create_event",
      entityType: "event",
      userId: "user-1",
      limit: 25,
      offset: 50,
    };
    invoke.mockResolvedValue({ data: { data: result }, error: null });

    await expect(activityLogsService.getLogs(input)).resolves.toEqual(result);
    expect(invoke).toHaveBeenCalledWith("activity-logs", {
      body: { resource: "activity-logs", operation: "list", input },
    });
  });

  it("loads action type rows", async () => {
    const rows = [{ action_type: "login" }];
    invoke.mockResolvedValue({ data: { data: rows }, error: null });

    await expect(activityLogsService.getActionTypeRows()).resolves.toEqual(rows);
    expect(invoke).toHaveBeenCalledWith("activity-logs", {
      body: { resource: "activity-logs", operation: "action-types" },
    });
  });

  it("clears logs through the activity-logs function", async () => {
    invoke.mockResolvedValue({ data: { data: null }, error: null });

    await expect(activityLogsService.clearLogs()).resolves.toBeUndefined();
    expect(invoke).toHaveBeenCalledWith("activity-logs", {
      body: { resource: "activity-logs", operation: "clear" },
    });
  });

  it("inserts an activity log through the activity-logs function", async () => {
    const payload = { action_type: "login", metadata: {} };
    invoke.mockResolvedValue({ data: { data: null }, error: null });

    await expect(activityLogsService.logActivity(payload)).resolves.toBeUndefined();
    expect(invoke).toHaveBeenCalledWith("activity-logs", {
      body: { resource: "activity-logs", operation: "create", input: payload },
    });
  });

  it("loads entity type rows", async () => {
    const rows = [{ entity_type: "event" }];
    invoke.mockResolvedValue({ data: { data: rows }, error: null });

    await expect(activityLogsService.getEntityTypeRows()).resolves.toEqual(rows);
    expect(invoke).toHaveBeenCalledWith("activity-logs", {
      body: { resource: "activity-logs", operation: "entity-types" },
    });
  });
});
