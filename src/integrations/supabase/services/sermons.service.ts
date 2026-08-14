import { invokeFunction } from "../functions";

type SermonInsert = {
  title: string;
  description: string | null;
  sermon_date: string;
  pastor: string | null;
  video_url: string | null;
  audio_url: string | null;
};

type Sermon = SermonInsert & {
  id: string;
  created_at: string;
};

export const sermonsService = {
  async getAll(): Promise<Sermon[]> {
    return invokeFunction<Sermon[]>("content-data", {
      resource: "sermons",
      operation: "list",
    });
  },

  async getLatest(): Promise<Sermon | null> {
    return invokeFunction<Sermon | null>("content-data", {
      resource: "sermons",
      operation: "latest",
    });
  },

  async create(sermon: SermonInsert): Promise<Sermon> {
    return invokeFunction<Sermon>("content-data", {
      resource: "sermons",
      operation: "create",
      input: sermon,
    });
  },

  async update(params: Partial<Sermon> & { id: string }): Promise<Sermon> {
    return invokeFunction<Sermon>("content-data", {
      resource: "sermons",
      operation: "update",
      input: params,
    });
  },

  async deleteSermon(id: string): Promise<string> {
    return invokeFunction<string>("content-data", {
      resource: "sermons",
      operation: "delete",
      input: { id },
    });
  },
};
