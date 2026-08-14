import { givingService } from "@/integrations/supabase/services/giving.service";
import { useMutation, useQuery, useQueryClient } from "./simple-query-hooks";
import type { GivingSettings } from "@/components/admin/adminconstants/giving/admingiving";

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
