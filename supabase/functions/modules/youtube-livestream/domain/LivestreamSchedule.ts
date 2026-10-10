export const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export const isEligibleCheckingWindow = (_now: Date): boolean => true;

export const isFreshAttempt = (
  attemptedAt: string | null,
  now: Date,
): boolean => {
  if (!attemptedAt) {
    return false;
  }

  const attemptedTime = new Date(attemptedAt).getTime();
  if (Number.isNaN(attemptedTime)) {
    return false;
  }

  return now.getTime() - attemptedTime < REFRESH_INTERVAL_MS;
};
