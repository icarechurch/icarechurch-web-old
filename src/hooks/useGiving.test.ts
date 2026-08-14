import { beforeEach, describe, expect, it, vi } from "vitest";
import { givingService } from "@/integrations/supabase/services/giving.service";
import { useGivingSettings } from "./useGiving";

const { useQuery } = vi.hoisted(() => ({ useQuery: vi.fn() }));

vi.mock("./simple-query-hooks", () => ({
  useMutation: vi.fn(),
  useQuery,
  useQueryClient: vi.fn(),
}));

vi.mock("@/integrations/supabase/services/giving.service", () => ({
  givingService: {
    getGivingSettings: vi.fn(),
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

describe("useGivingSettings", () => {
  beforeEach(() => {
    useQuery.mockReset();
    vi.mocked(givingService.getGivingSettings).mockReset();
  });

  it("uses the giving service for its query function", async () => {
    useQuery.mockImplementation((options) => options);
    const settings = { id: "giving-1" };
    vi.mocked(givingService.getGivingSettings).mockResolvedValue(settings);

    const query = useGivingSettings();

    await expect(query.queryFn()).resolves.toEqual(settings);
    expect(givingService.getGivingSettings).toHaveBeenCalledOnce();
  });
});
