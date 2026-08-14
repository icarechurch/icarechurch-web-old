export type Ministry = {
  id: string;
  name: string;
  description: string | null;
  leader: string | null;
  meeting_time: string | null;
  image_url: string | null;
  sort_order: number | null;
  category: "ministry" | "outreach";
  created_at: string;
  updated_at: string;
};

export type MinistryInsert = Omit<Ministry, "id" | "created_at" | "updated_at"> & {
  id?: string;
};
