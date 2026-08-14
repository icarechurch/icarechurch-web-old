import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "./simple-query-hooks";
import type { GivingSettings } from "@/components/admin/adminconstants/giving/admingiving";

export const useGivingSettings = () => {
  return useQuery({
    queryKey: ["giving-settings"],
    queryFn: async (): Promise<GivingSettings> => {
      const { data, error } = await supabase
        .from("giving_settings")
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data as GivingSettings;
    },
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
