import { galleryApi } from "@/domains/gallery/api/gallery.api";
import type { GalleryImageInsert } from "@/domains/gallery/model/gallery.types";
import { logActivity } from "@/domains/activity-logs/hooks/useActivityLogs";
import { LOG_ACTION_TYPES } from "@/domains/activity-logs/model/logging.types";
import { useMutation, useQuery, useQueryClient } from "@/shared/hooks/simple-query-hooks";

export function useGallery() { return useQuery({ queryKey: ["gallery"], queryFn: async () => galleryApi.getGalleryImages() }); }
export function useGalleryMutations() {
  const queryClient = useQueryClient();
  const uploadImage = useMutation({ mutationFn: async (image: GalleryImageInsert) => galleryApi.create(image), onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["gallery"] }); logActivity(LOG_ACTION_TYPES.UPLOAD_IMAGE, { description: `Uploaded image: ${data.title}`, entityType: "gallery_image", entityId: data.id }); } });
  const deleteImage = useMutation({ mutationFn: async (id: string) => galleryApi.deleteGalleryImage(id), onSuccess: (id) => { queryClient.invalidateQueries({ queryKey: ["gallery"] }); logActivity(LOG_ACTION_TYPES.DELETE_IMAGE, { description: "Deleted a gallery image", entityType: "gallery_image", entityId: id }); } });
  return { uploadImage, deleteImage };
}
