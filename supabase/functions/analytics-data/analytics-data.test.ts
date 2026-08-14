import { HttpError } from "../_shared/errors.ts";
import { dispatchAnalyticsRequest } from "./index.ts";

Deno.test("dispatches an analytics summary operation", async () => {
  const result = await dispatchAnalyticsRequest(
    { resource: "analytics", operation: "summary", input: { daysBack: 30 } },
    {
      summary: async (input) => input,
    },
  );

  if (!result || (result as { daysBack: number }).daysBack !== 30) {
    throw new Error("The analytics summary handler was not called");
  }
});

Deno.test("dispatches the bounded analytics overview operation", async () => {
  const result = await dispatchAnalyticsRequest(
    { resource: "analytics", operation: "overview", input: { daysBack: 30 } },
    {
      overview: async (input) => input,
    },
  );

  if (!result || (result as { daysBack: number }).daysBack !== 30) {
    throw new Error("The analytics overview handler was not called");
  }
});

Deno.test("rejects an unsupported analytics operation", async () => {
  try {
    await dispatchAnalyticsRequest(
      { resource: "analytics", operation: "unknown" },
      {},
    );
  } catch (error) {
    if (
      !(error instanceof HttpError) ||
      error.code !== "INVALID_OPERATION" ||
      error.status !== 400
    ) {
      throw new Error("Unexpected error for an unknown operation");
    }
    return;
  }

  throw new Error("Expected an unknown operation to be rejected");
});
