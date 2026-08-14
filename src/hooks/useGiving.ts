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
    }) => {
      const { error } = await supabase
        .from("giving_settings")
        .update(updates)
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["giving-settings"] });
    },
  });
};
