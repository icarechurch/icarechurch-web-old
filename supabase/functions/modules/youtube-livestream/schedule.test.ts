import {
  isEligibleCheckingWindow,
  isFreshAttempt,
} from "./schedule.ts";

const taipeiSundayAtFive = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day - 1, 21));

Deno.test("accepts only the first 52 Sunday morning windows in Taipei time", () => {
  for (let sundayNumber = 1; sundayNumber <= 52; sundayNumber += 1) {
    const firstSunday = new Date(Date.UTC(2023, 0, 1));
    const sunday = new Date(firstSunday);
    sunday.setUTCDate(firstSunday.getUTCDate() + (sundayNumber - 1) * 7);
    const windowStart = new Date(
      Date.UTC(
        sunday.getUTCFullYear(),
        sunday.getUTCMonth(),
        sunday.getUTCDate() - 1,
        21,
      ),
    );

    if (!isEligibleCheckingWindow(windowStart)) {
      throw new Error(`Expected Sunday ${sundayNumber} to be eligible`);
    }
  }

  if (isEligibleCheckingWindow(taipeiSundayAtFive(2023, 12, 31))) {
    throw new Error("Expected the 53rd Sunday to be ineligible");
  }
});

Deno.test("enforces the Sunday window boundaries in Asia/Taipei", () => {
  const cases = [
    ["04:59", "2026-01-03T20:59:00.000Z", false],
    ["05:00", "2026-01-03T21:00:00.000Z", true],
    ["11:59", "2026-01-04T03:59:00.000Z", true],
    ["12:00", "2026-01-04T04:00:00.000Z", false],
    ["weekday", "2026-01-05T00:00:00.000Z", false],
  ] as const;

  for (const [label, timestamp, expected] of cases) {
    if (isEligibleCheckingWindow(new Date(timestamp)) !== expected) {
      throw new Error(`Unexpected eligibility for ${label}`);
    }
  }
});

Deno.test("allows a fresh attempt for less than ten minutes", () => {
  const attemptedAt = "2026-01-04T00:00:00.000Z";

  if (!isFreshAttempt(attemptedAt, new Date("2026-01-04T00:09:59.999Z"))) {
    throw new Error("Expected a 9:59.999 attempt to be fresh");
  }

  if (isFreshAttempt(attemptedAt, new Date("2026-01-04T00:10:00.000Z"))) {
    throw new Error("Expected a ten-minute-old attempt to be stale");
  }
});
