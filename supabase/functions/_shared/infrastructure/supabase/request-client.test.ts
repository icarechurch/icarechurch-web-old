import {
  createRequestSupabaseClient,
  type EnvironmentReader,
} from "./request-client.ts";

const createEnvironment = (
  values: Record<string, string | undefined>,
): EnvironmentReader => ({
  get(name: string) {
    return values[name];
  },
});

Deno.test("creates a request client with the caller authorization", () => {
  const client = createRequestSupabaseClient(
    new Request("https://example.com", {
      headers: { Authorization: "Bearer user-token" },
    }),
    createEnvironment({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    }),
  ) as unknown as { rest: { headers: Headers } };

  if (client.rest.headers.get("Authorization") !== "Bearer user-token") {
    throw new Error("The request authorization header was not forwarded");
  }
});

Deno.test("rejects missing Supabase function configuration", () => {
  try {
    createRequestSupabaseClient(
      new Request("https://example.com"),
      createEnvironment({ SUPABASE_URL: "https://example.supabase.co" }),
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Supabase function environment is not configured"
    ) {
      return;
    }
  }

  throw new Error("Expected missing Supabase configuration to be rejected");
});
