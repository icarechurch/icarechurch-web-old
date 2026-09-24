import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_STALE_TIME = 30_000;
const CACHE_RETENTION_TIME = 5 * 60_000;

interface UseQueryOptions<T> {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  refetchInterval?: number;
  retry?: number;
  staleTime?: number;
}

interface QuerySnapshot<T> {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  status: "pending" | "error" | "success";
}

interface QueryCacheEntry<T> extends QuerySnapshot<T> {
  expiresAt: number;
  promise?: Promise<T>;
  listeners: Set<() => void>;
  cleanupTimer?: ReturnType<typeof setTimeout>;
}

interface UseQueryResult<T> extends QuerySnapshot<T> {
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
}

const queryCache = new Map<string, QueryCacheEntry<unknown>>();

function getCacheEntry<T>(key: string): QueryCacheEntry<T> {
  const existing = queryCache.get(key) as QueryCacheEntry<T> | undefined;
  if (existing) return existing;

  const entry: QueryCacheEntry<T> = {
    data: undefined,
    error: null,
    isLoading: false,
    status: "pending",
    expiresAt: 0,
    listeners: new Set(),
  };
  queryCache.set(key, entry as QueryCacheEntry<unknown>);
  return entry;
}

function notify<T>(entry: QueryCacheEntry<T>): void {
  for (const listener of entry.listeners) {
    listener();
  }
}

function scheduleCacheCleanup(key: string, entry: QueryCacheEntry<unknown>): void {
  if (entry.cleanupTimer) clearTimeout(entry.cleanupTimer);

  entry.cleanupTimer = setTimeout(() => {
    if (
      entry.listeners.size === 0 &&
      !entry.promise &&
      entry.expiresAt <= Date.now()
    ) {
      queryCache.delete(key);
    }
  }, CACHE_RETENTION_TIME);
}

async function loadQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  staleTime: number,
  force: boolean,
): Promise<T | undefined> {
  const entry = getCacheEntry<T>(key);

  if (entry.promise) return entry.promise;
  if (!force && entry.status === "success" && entry.expiresAt > Date.now()) {
    return entry.data;
  }

  entry.isLoading = true;
  entry.status = "pending";
  entry.error = null;
  notify(entry);

  const promise = queryFn()
    .then((result) => {
      entry.data = result;
      entry.error = null;
      entry.isLoading = false;
      entry.status = "success";
      entry.expiresAt = Date.now() + staleTime;
      return result;
    })
    .catch((error: unknown) => {
      entry.error = error;
      entry.isLoading = false;
      entry.status = "error";
      entry.expiresAt = 0;
      throw error;
    })
    .finally(() => {
      if (entry.promise === promise) entry.promise = undefined;
      notify(entry);
    });

  entry.promise = promise;
  notify(entry);
  return promise;
}

export function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  refetchInterval,
  staleTime = DEFAULT_STALE_TIME,
}: UseQueryOptions<T>): UseQueryResult<T> {
  const stableKey = useMemo(() => JSON.stringify(queryKey), queryKey);
  const entry = getCacheEntry<T>(stableKey);
  const [snapshot, setSnapshot] = useState<QuerySnapshot<T>>(() => ({
    data: entry.data,
    error: entry.error,
    isLoading: enabled && entry.status !== "success",
    status: entry.status,
  }));

  const fnRef = useRef(queryFn);
  fnRef.current = queryFn;

  const syncSnapshot = useCallback(() => {
    const current = getCacheEntry<T>(stableKey);
    setSnapshot({
      data: current.data,
      error: current.error,
      isLoading: current.isLoading,
      status: current.status,
    });
  }, [stableKey]);

  const fetchData = useCallback(
    async (force = false): Promise<void> => {
      if (!enabled) return;

      try {
        await loadQuery(stableKey, () => fnRef.current(), staleTime, force);
      } catch {
        // The cache stores the error and subscribers receive it through syncSnapshot.
      }
    },
    [enabled, stableKey, staleTime],
  );

  useEffect(() => {
    const current = getCacheEntry<T>(stableKey);
    current.listeners.add(syncSnapshot);
    syncSnapshot();

    return () => {
      current.listeners.delete(syncSnapshot);
      if (current.listeners.size === 0) {
        scheduleCacheCleanup(stableKey, current as QueryCacheEntry<unknown>);
      }
    };
  }, [stableKey, syncSnapshot]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      void fetchData(true);
    }, refetchInterval);
    return () => clearInterval(interval);
  }, [enabled, fetchData, refetchInterval]);

  useEffect(() => {
    const primaryKey = queryKey[0];
    if (typeof primaryKey !== "string") return;

    const handleInvalidate = () => {
      void fetchData(true);
    };

    window.addEventListener(`invalidate-${primaryKey}`, handleInvalidate);
    return () => {
      window.removeEventListener(`invalidate-${primaryKey}`, handleInvalidate);
    };
  }, [fetchData, queryKey]);

  return {
    ...snapshot,
    isError: snapshot.status === "error",
    isSuccess: snapshot.status === "success",
    refetch: async () => fetchData(true),
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
  const [error, setError] = useState<unknown>(null);

  const mutate = async (variables: TVariables) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      onSuccess?.(result);
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
    invalidateQueries: ({ queryKey }: { queryKey: unknown[] }) => {
      window.dispatchEvent(new Event(`invalidate-${queryKey[0]}`));
    },
  };
}
