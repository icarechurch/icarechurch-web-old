import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from "./client";
import { invokeFunction } from "./functions";

describe("invokeFunction", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("unwraps a successful Edge Function response", async () => {
    vi.spyOn(supabase.functions, "invoke").mockResolvedValue({
      data: { data: [{ id: "event-1" }] },
      error: null,
    });

    await expect(
      invokeFunction("content-data", {
        resource: "events",
        operation: "list",
      }),
    ).resolves.toEqual([{ id: "event-1" }]);
  });
});
