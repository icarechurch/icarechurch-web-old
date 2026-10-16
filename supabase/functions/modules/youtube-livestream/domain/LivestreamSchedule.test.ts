import {
  isEligibleCheckingWindow,
  isFreshAttempt,
} from "./LivestreamSchedule.ts";

Deno.test("allows active livestream checks every day and hour", () => {
  const cases = [
    ["Saturday morning", "2026-10-10T01:53:00.000Z"],
    ["Sunday morning", "2026-01-04T00:00:00.000Z"],
    ["weekday evening", "2026-01-05T12:00:00.000Z"],
  ] as const;

  for (const [label, timestamp] of cases) {
    if (!isEligibleCheckingWindow(new Date(timestamp))) {
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
