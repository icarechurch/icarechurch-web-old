export const TAIPEI_TIME_ZONE = "Asia/Taipei";
export const CHECK_WINDOW_START_HOUR = 5;
export const CHECK_WINDOW_END_HOUR = 12;
export const MAX_SUNDAY_WINDOWS = 52;
export const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

const taipeiDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  hourCycle: "h23",
  month: "numeric",
  timeZone: TAIPEI_TIME_ZONE,
  weekday: "long",
  year: "numeric",
});

type TaipeiDateParts = {
  day: number;
  hour: number;
  month: number;
  weekday: string;
  year: number;
};

const getTaipeiDateParts = (now: Date): TaipeiDateParts => {
  const parts = taipeiDateFormatter.formatToParts(now);
  const values = new Map(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return {
    day: Number(values.get("day")),
    hour: Number(values.get("hour")),
    month: Number(values.get("month")),
    weekday: values.get("weekday") ?? "",
    year: Number(values.get("year")),
  };
};

const getSundayNumber = ({ day, month, year }: TaipeiDateParts): number => {
  const localDate = new Date(Date.UTC(year, month - 1, day));
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
  const dayOfYear =
    Math.floor((localDate.getTime() - firstDayOfYear.getTime()) / 86_400_000) + 1;
  const firstSundayDay = 1 + ((7 - firstDayOfYear.getUTCDay()) % 7);

  if (dayOfYear < firstSundayDay) {
    return 0;
  }

  return Math.floor((dayOfYear - firstSundayDay) / 7) + 1;
};

export const isEligibleCheckingWindow = (now: Date): boolean => {
  const parts = getTaipeiDateParts(now);

  return (
    parts.weekday === "Sunday" &&
    parts.hour >= CHECK_WINDOW_START_HOUR &&
    parts.hour < CHECK_WINDOW_END_HOUR &&
    getSundayNumber(parts) <= MAX_SUNDAY_WINDOWS
  );
};

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
