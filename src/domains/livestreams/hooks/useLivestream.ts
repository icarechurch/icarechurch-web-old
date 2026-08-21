import { livestreamsApi } from "@/domains/livestreams/api/livestreams.api";
import { useQuery } from "@/shared/hooks/simple-query-hooks";

export function useLivestream() {
  return useQuery({
    queryKey: ["youtube-livestream"],
    queryFn: async () => livestreamsApi.getActive(),
    staleTime: 60_000,
  });
}
