import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseQueryOptions<T> {
  queryKey: any[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  refetchInterval?: number;
  retry?: number;
}

interface UseQueryResult<T> {
  data: T | undefined;
  error: any;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
  status: "pending" | "error" | "success";
}

export function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  refetchInterval,
}: UseQueryOptions<T>): UseQueryResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [status, setStatus] = useState<"pending" | "error" | "success">(
    "pending"
  );

  const fnRef = useRef(queryFn);
  fnRef.current = queryFn; // Keep latest ref

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableKey = useMemo(() => JSON.stringify(queryKey), queryKey);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setStatus("pending");
    try {
      const result = await fnRef.current();
      setData(result);
      setError(null);
      setStatus("success");
    } catch (err) {
      setError(err);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, stableKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, fetchData, enabled]);

  // Listen for real-time invalidation events
  useEffect(() => {
    const primaryKey = queryKey[0];
    if (typeof primaryKey !== "string") return;

    const handleInvalidate = () => {
      fetchData();
    };

    window.addEventListener(`invalidate-${primaryKey}`, handleInvalidate);
    return () => {
      window.removeEventListener(`invalidate-${primaryKey}`, handleInvalidate);
    };
  }, [queryKey, fetchData]);

  return {
    data,
    error,
    isLoading,
    isError: status === "error",
    isSuccess: status === "success",
    refetch: fetchData,
    status,
  };
}

export function useMutation<TVariables, TData>({
  mutationFn,
  onSuccess,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (variables: TVariables) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, mutateAsync: mutate, isLoading, error };
}

export function useQueryClient() {
  return {
    invalidateQueries: ({ queryKey }: { queryKey: any[] }) => {
      // Dispatch event to trigger refetch
      // In a real simplified implementation, we might use a global event bus or context to trigger refetches.
      // For now, we accept that data might be stale until page reload or manual refetch.
      // A simple hack is dispatching a window event.
      window.dispatchEvent(new Event(`invalidate-${queryKey[0]}`));
    },
  };
}
