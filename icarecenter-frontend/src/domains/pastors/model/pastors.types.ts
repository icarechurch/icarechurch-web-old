export type Pastor = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  bio: string | null;
  image_url: string | null;
  facebook_url: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export type PastorInsert = Omit<Pastor, "id" | "created_at" | "updated_at"> & { id?: string };
