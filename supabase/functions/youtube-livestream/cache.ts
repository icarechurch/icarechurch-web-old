import { createClient } from "npm:@supabase/supabase-js@2";
import type { LiveStream } from "./types.ts";
import type { CacheStatus } from "./types.ts";

const CACHE_TABLE = "youtube_livestream_status" as const;
const CLAIM_RPC = "claim_youtube_livestream_refresh" as const;

type CacheError = { message: string };

type CacheTableClient = {
  select: (columns: "*") => {
    eq: (column: "singleton_key", value: true) => {
      maybeSingle: () => Promise<{
        data: CacheStatus | null;
        error: CacheError | null;
      }>;
    };
  };
  update: (values: Partial<CacheStatus>) => {
    eq: (
      column: "singleton_key",
      value: true,
    ) => Promise<{ error: CacheError | null }>;
  };
};

export type CacheClient = {
  from: (table: typeof CACHE_TABLE) => CacheTableClient;
  rpc: (
    name: typeof CLAIM_RPC,
    args: { p_now: string },
  ) => Promise<{ data: boolean | null; error: CacheError | null }>;
};

export type CacheRepository = {
  readStatus: () => Promise<CacheStatus>;
  claimRefresh: (now: Date) => Promise<boolean>;
  saveLive: (stream: LiveStream) => Promise<void>;
  saveOffline: () => Promise<void>;
};

const throwCacheError = (error: CacheError): never => {
  throw new Error(`Livestream cache operation failed: ${error.message}`);
};

export const createCacheRepository = (client: CacheClient): CacheRepository => ({
  async readStatus() {
    const { data, error } = await client
      .from(CACHE_TABLE)
      .select("*")
      .eq("singleton_key", true)
      .maybeSingle();

    if (error) {
      throwCacheError(error);
    }

    if (!data) {
      throw new Error("Livestream cache row is missing");
    }

    return data;
  },

  async claimRefresh(now) {
    const { data, error } = await client.rpc(CLAIM_RPC, {
      p_now: now.toISOString(),
    });

    if (error) {
      throwCacheError(error);
    }

    if (typeof data !== "boolean") {
      throw new Error("Livestream cache claim returned an invalid result");
    }

    return data;
  },

  async saveLive(stream) {
    const { error } = await client
      .from(CACHE_TABLE)
      .update({
        status: "live",
        video_id: stream.id,
        video_title: stream.title,
        refresh_lease_until: null,
      })
      .eq("singleton_key", true);

    if (error) {
      throwCacheError(error);
    }
  },

  async saveOffline() {
    const { error } = await client
      .from(CACHE_TABLE)
      .update({
        status: "offline",
        video_id: null,
        video_title: null,
        refresh_lease_until: null,
      })
      .eq("singleton_key", true);

    if (error) {
      throwCacheError(error);
    }
  },
});

export const createServiceRoleCacheRepository = (): CacheRepository => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase function environment is not configured");
  }

  const client = createClient(supabaseUrl, serviceRoleKey) as unknown as CacheClient;
  return createCacheRepository(client);
};
