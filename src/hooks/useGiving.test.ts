import { beforeEach, describe, expect, it, vi } from "vitest";
import { givingService } from "@/integrations/supabase/services/giving.service";
import { useGivingSettings, useUpdateGivingSettings } from "./useGiving";

const { useMutation, useQuery } = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("./simple-query-hooks", () => ({
  useMutation,
  useQuery,
  useQueryClient: vi.fn(),
}));

vi.mock("@/integrations/supabase/services/giving.service", () => ({
  givingService: {
    getGivingSettings: vi.fn(),
    updateGivingSettings: vi.fn(),
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

describe("useGivingSettings", () => {
  beforeEach(() => {
    useMutation.mockReset();
    useQuery.mockReset();
    vi.mocked(givingService.getGivingSettings).mockReset();
    vi.mocked(givingService.updateGivingSettings).mockReset();
  });

  it("uses the giving service for its query function", async () => {
    useQuery.mockImplementation((options) => options);
    const settings = { id: "giving-1" };
    vi.mocked(givingService.getGivingSettings).mockResolvedValue(settings);

    const query = useGivingSettings();

    await expect(query.queryFn()).resolves.toEqual(settings);
    expect(givingService.getGivingSettings).toHaveBeenCalledOnce();
  });

  it("uses the giving service for updates", async () => {
    useMutation.mockImplementation((options) => options);
    vi.mocked(givingService.updateGivingSettings).mockResolvedValue();

    const mutation = useUpdateGivingSettings();
    const updates = { donation_platform_name: "Give" };

    await expect(mutation.mutationFn({ id: "giving-1", updates }))
      .resolves.toBeUndefined();
    expect(givingService.updateGivingSettings).toHaveBeenCalledWith(
      "giving-1",
      updates,
    );
  });
});
