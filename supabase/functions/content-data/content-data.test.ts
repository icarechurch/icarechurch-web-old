import { HttpError } from "../_shared/errors.ts";
import { dispatchContentRequest } from "./index.ts";

Deno.test("dispatches an events list operation to the events resource", async () => {
  const result = await dispatchContentRequest(
    { resource: "events", operation: "list" },
    {
      events: {
        list: async () => [{ id: "event-1" }],
      },
    },
  );

  if (!Array.isArray(result) || result[0]?.id !== "event-1") {
    throw new Error("The events list handler was not called");
  }
});

Deno.test("rejects an unknown content operation", async () => {
  try {
    await dispatchContentRequest(
      { resource: "unknown", operation: "list" },
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
