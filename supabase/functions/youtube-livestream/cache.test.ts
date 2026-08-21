import {
  createCacheRepository,
  type CacheClient,
  type CacheStatus,
} from "./cache.ts";

const initialStatus: CacheStatus = {
  singleton_key: true,
  status: "offline",
  video_id: null,
  video_title: null,
  provider_attempted_at: "2026-01-04T05:00:00.000Z",
  refresh_lease_until: null,
};

const createFakeClient = () => {
  const calls: Array<Record<string, unknown>> = [];
  let updatePayload: Record<string, unknown> | null = null;

  const client: CacheClient = {
    from(table) {
      calls.push({ operation: "from", table });
      return {
        select(columns) {
          calls.push({ operation: "select", columns });
          return {
            eq(column, value) {
              calls.push({ operation: "select.eq", column, value });
              return {
                async maybeSingle() {
                  calls.push({ operation: "maybeSingle" });
                  return { data: initialStatus, error: null };
                },
              };
            },
          };
        },
        update(values) {
          updatePayload = values;
          calls.push({ operation: "update", values });
          return {
            async eq(column, value) {
              calls.push({ operation: "update.eq", column, value });
              return { error: null };
            },
          };
        },
      };
    },
    async rpc(name, args) {
      calls.push({ operation: "rpc", name, args });
      return { data: true, error: null };
    },
  };

  return { calls, client, getUpdatePayload: () => updatePayload };
};

Deno.test("readStatus selects only the singleton cache row", async () => {
  const fake = createFakeClient();
  const repository = createCacheRepository(fake.client);

  const status = await repository.readStatus();

  if (status !== initialStatus) {
    throw new Error("Expected the cache status row");
  }

  const calls = fake.calls.map(({ operation }) => operation).join(",");
  if (calls !== "from,select,select.eq,maybeSingle") {
    throw new Error(`Unexpected read calls: ${calls}`);
  }
});

Deno.test("claimRefresh invokes only the atomic claim RPC", async () => {
  const fake = createFakeClient();
  const repository = createCacheRepository(fake.client);
  const now = new Date("2026-01-04T05:00:00.000Z");

  if (!(await repository.claimRefresh(now))) {
    throw new Error("Expected the refresh claim");
  }

  const rpcCall = fake.calls.find(({ operation }) => operation === "rpc");
  if (
    rpcCall?.name !== "claim_youtube_livestream_refresh" ||
    (rpcCall.args as { p_now: string }).p_now !== now.toISOString()
  ) {
    throw new Error("Expected the refresh RPC with the current timestamp");
  }

  if (fake.calls.some(({ operation }) => operation === "from")) {
    throw new Error("Claiming must not read the cache first");
  }
});

Deno.test("saveLive writes a live result and clears the refresh lease", async () => {
  const fake = createFakeClient();
  const repository = createCacheRepository(fake.client);

  await repository.saveLive({ id: "video-123", title: "Sunday service" });

  const payload = fake.getUpdatePayload();
  if (
    payload?.status !== "live" ||
    payload.video_id !== "video-123" ||
    payload.video_title !== "Sunday service" ||
    payload.refresh_lease_until !== null ||
    "provider_attempted_at" in payload
  ) {
    throw new Error("Expected live fields and a cleared lease");
  }
});

Deno.test("saveOffline preserves the claim timestamp and clears the lease", async () => {
  const fake = createFakeClient();
  const repository = createCacheRepository(fake.client);

  await repository.saveOffline();

  const payload = fake.getUpdatePayload();
  if (
    payload?.status !== "offline" ||
    payload.video_id !== null ||
    payload.video_title !== null ||
    payload.refresh_lease_until !== null ||
    "provider_attempted_at" in payload
  ) {
    throw new Error("Expected offline fields without changing the claim time");
  }
});
