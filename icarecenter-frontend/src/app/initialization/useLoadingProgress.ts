import { useEffect, useState } from "react";

interface QueryState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  status: string;
}

export function useLoadingProgress(
  queries: QueryState[],
  isOnline: boolean,
) {
  const [progress, setProgress] = useState(0);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const allQueriesLoaded = queries.every((q) => q.isSuccess || q.isError);
  const anyQueryLoading = queries.some((q) => q.isLoading);

  useEffect(() => {
    if (!isOnline) {
      setProgress(0);
      return;
    }

    const completed = queries.filter((q) => q.isSuccess || q.isError).length;
    const calculated = (completed / queries.length) * 100;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (Math.abs(prev - calculated) < 1) {
          clearInterval(progressInterval);
          return calculated;
        }
        return prev + (calculated - prev) * 0.1;
      });
    }, 50);

    return () => clearInterval(progressInterval);
    // Spread status strings as deps to avoid object reference churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries.map((q) => q.status).join(","), isOnline]);

  useEffect(() => {
    if (isOnline && allQueriesLoaded && !anyQueryLoading) {
      const timer = setTimeout(() => {
        setHasInitialData(true);
        setHasLoadedOnce(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, allQueriesLoaded, anyQueryLoading]);

  return { progress, hasInitialData, hasLoadedOnce };
}
