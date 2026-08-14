import { logActivity } from "@/hooks/useLogs";
import { logActivity } from "@/hooks/useLogs";
import { LOG_ACTION_TYPES } from "@/integrations/supabase/loggingTypes";
import {
  churchInfoService,
  galleryService,
  pastorsService,
} from "@/integrations/supabase/services";
import { useMutation, useQuery, useQueryClient } from "@/shared/hooks/simple-query-hooks";

// Types
export type ChurchInfo = {
  id: string;
  pastor_name: string | null;
  pastor_email: string | null;
  pastor_phone: string | null;
  church_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  office_hours: string | null;
  fallback_stream_url: string | null;
  created_at: string;
  updated_at: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
};

export type GalleryImageInsert = Omit<GalleryImage, "id" | "created_at"> & {
  id?: string;
};

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

export type PastorInsert = Omit<Pastor, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

// Church Info
export function useChurchInfo() {
  return useQuery({
    queryKey: ["church_info"],
    queryFn: async () => churchInfoService.getChurchInfo(),
  });
}

export function useChurchInfoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ChurchInfo> & { id: string }) =>
      churchInfoService.update({ id, ...updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["church_info"] });
      logActivity(LOG_ACTION_TYPES.UPDATE_CHURCH_INFO, {
        description: "Updated church information",
        entityType: "church_info",
      });
    },
  });
}

// Gallery
export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => galleryService.getGalleryImages(),
  });
}

export function useGalleryMutations() {
  const queryClient = useQueryClient();

  const uploadImage = useMutation({
    mutationFn: async (image: GalleryImageInsert) =>
      galleryService.create(image),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      logActivity(LOG_ACTION_TYPES.UPLOAD_IMAGE, {
        description: `Uploaded image: ${data.title}`,
        entityType: "gallery_image",
        entityId: data.id,
      });
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => galleryService.deleteGalleryImage(id),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      logActivity(LOG_ACTION_TYPES.DELETE_IMAGE, {
        description: "Deleted a gallery image",
        entityType: "gallery_image",
        entityId: id,
      });
    },
  });

  return { uploadImage, deleteImage };
}

// Pastors
export function usePastors() {
  return useQuery({
    queryKey: ["pastors"],
    queryFn: async () => pastorsService.getAll(),
  });
}

export function usePastorMutations() {
  const queryClient = useQueryClient();

  const createPastor = useMutation({
    mutationFn: async (pastor: PastorInsert) => pastorsService.create(pastor),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pastors"] });
      logActivity(LOG_ACTION_TYPES.CREATE_PASTOR, {
        description: `Created pastor: ${data.name}`,
        entityType: "pastor",
        entityId: data.id,
      });
    },
  });

  const updatePastor = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Pastor> & { id: string }) =>
      pastorsService.update({ id, ...updates }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pastors"] });
      logActivity(LOG_ACTION_TYPES.UPDATE_PASTOR, {
        description: `Updated pastor: ${data.name}`,
        entityType: "pastor",
        entityId: data.id,
      });
    },
  });

  const deletePastor = useMutation({
    mutationFn: async (id: string) => pastorsService.deletePastor(id),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["pastors"] });
      logActivity(LOG_ACTION_TYPES.DELETE_PASTOR, {
        description: "Deleted a pastor",
        entityType: "pastor",
        entityId: id,
      });
    },
  });

  const updateSortOrder = useMutation({
    mutationFn: async (items: Array<{ id: string; sort_order: number }>) =>
      pastorsService.updateSortOrder(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pastors"] }),
  });

  return { createPastor, updatePastor, deletePastor, updateSortOrder };
}
