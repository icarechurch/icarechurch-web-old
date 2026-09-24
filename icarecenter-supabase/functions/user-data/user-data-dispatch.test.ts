import { dispatchUserDataRequest } from "./index.ts";
import { createUserDataHandlers } from "./queries.ts";

Deno.test("dispatches the frontend roles/get request", async () => {
  const query = {
    select() {
      return query;
    },
    eq() {
      return query;
    },
    maybeSingle() {
      return Promise.resolve({ data: { role: "admin" }, error: null });
    },
  };
  const client = { from: () => query };

  const result = await dispatchUserDataRequest(
    {
      resource: "roles",
      operation: "get",
      input: { userId: "admin-user" },
    },
    createUserDataHandlers(client as never),
  );

  if (result !== "admin") {
    throw new Error(`Expected the admin role, received ${String(result)}`);
  }
});
