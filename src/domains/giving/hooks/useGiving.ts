import { givingService } from "@/domains/giving/api/giving.api";
import { useMutation, useQuery, useQueryClient } from "@/shared/hooks/simple-query-hooks";
import type { GivingSettings } from "@/domains/giving/model/giving.types";

export const useGivingSettings = () => {
  return useQuery({
    queryKey: ["giving-settings"],
    queryFn: async (): Promise<GivingSettings> => givingService.getGivingSettings(),
  });
};

export const useUpdateGivingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<GivingSettings>;
    }) => givingService.updateGivingSettings(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["giving-settings"] });
    },
  });
};
