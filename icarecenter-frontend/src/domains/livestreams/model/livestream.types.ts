export type Livestream =
  | {
      status: "live";
      video: { id: string; title: string };
      checkedAt: string;
    }
  | {
      status: "past";
      video: { id: string; title: string };
      checkedAt: string;
    }
  | {
      status: "offline";
      checkedAt: string | null;
    };
