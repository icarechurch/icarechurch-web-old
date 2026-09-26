export type LiveStream = {
  id: string;
  title: string;
};

export type LivestreamResponse =
  | {
      status: "live";
      video: LiveStream;
      checkedAt: string;
    }
  | {
      status: "offline";
      checkedAt: string | null;
    };

export type CacheStatus = {
  singleton_key: true;
  status: "live" | "offline";
  video_id: string | null;
  video_title: string | null;
  provider_attempted_at: string | null;
  refresh_lease_until: string | null;
};
