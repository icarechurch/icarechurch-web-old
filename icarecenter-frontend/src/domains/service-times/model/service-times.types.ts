export type ServiceTime = {
  id: string;
  name: string;
  time: string;
  description: string | null;
  audience: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export type ServiceTimeInsert = Omit<ServiceTime, "id" | "created_at" | "updated_at"> & { id?: string };
