import { Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/components/ui/use-toast";
import { useGallery, useGalleryMutations } from "@/domains/gallery/hooks/useGallery";
import { storageService } from "@/domains/auth/api";
import {
  FORM_LABELS,
  GALLERY_STORAGE_BUCKET,
  getDialogDescription,
  getSubtitle,
  isGalleryFull,
  UI_TEXT,
} from "@/admin/gallery/gallery.constants";

export function AdminGalleryPage() {
  const { data: images, isLoading } = useGallery();
  const { uploadImage, deleteImage } = useGalleryMutations();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(selectedFile && title)) {
      return;
    }

    if (isGalleryFull(images?.length || 0)) {
      toast({
        title: UI_TEXT.limitReached.title,
        description: UI_TEXT.limitReached.description,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload file to Supabase Storage
      const { publicUrl } = await storageService.uploadImage({
        file: selectedFile,
        bucket: GALLERY_STORAGE_BUCKET,
      });

      // 2. Save to Database
      await uploadImage.mutateAsync({
        title,
        description: description || null,
        image_url: publicUrl,
      });

      toast({
        title: UI_TEXT.uploadSuccess.title,
        description: UI_TEXT.uploadSuccess.description,
      });

      setIsDialogOpen(false);
      resetForm();
    } catch (_error) {
      toast({
        title: UI_TEXT.uploadError.title,
        description: UI_TEXT.uploadError.description,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      // Extract filename from URL to delete from storage
      const fileName = imageUrl.split("/").at(-1);

      await deleteImage.mutateAsync(id);

      // Also delete the file from storage to prevent orphaned files
      if (fileName) {
        await storageService.deleteFile(GALLERY_STORAGE_BUCKET, fileName);
      }

      toast({
        title: UI_TEXT.deleteSuccess.title,
        description: UI_TEXT.deleteSuccess.description,
      });
    } catch (_error) {
      toast({
        title: UI_TEXT.deleteError.title,
        description: UI_TEXT.deleteError.description,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        {UI_TEXT.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold font-display text-2xl">{UI_TEXT.title}</h2>
          <p className="text-muted-foreground">
            {getSubtitle(images?.length || 0)}
          </p>
        </div>
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isGalleryFull(images?.length || 0)}>
              <Plus className="mr-2 h-4 w-4" />
              {UI_TEXT.addButton}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{UI_TEXT.dialogTitle}</DialogTitle>
              <DialogDescription>
                {getDialogDescription(images?.length || 0)}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleUpload}>
              <div className="space-y-2">
                <Label htmlFor="title">{FORM_LABELS.title}</Label>
                <Input
                  id="title"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={FORM_LABELS.titlePlaceholder}
                  required
                  value={title}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{FORM_LABELS.description}</Label>
                <Textarea
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={FORM_LABELS.descriptionPlaceholder}
                  value={description}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">{FORM_LABELS.imageFile}</Label>
                <Input
                  accept="image/*"
                  id="image"
                  onChange={handleFileChange}
                  required
                  type="file"
                />
              </div>
              <DialogFooter>
                <Button disabled={isUploading} type="submit">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {FORM_LABELS.uploadingButton}
                    </>
                  ) : (
                    FORM_LABELS.uploadButton
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {images?.map((image) => (
          <Card className="group overflow-hidden" key={image.id}>
            <div className="relative aspect-video">
              <img
                alt={image.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                height={720}
                src={image.image_url}
                width={1280}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  onClick={() => handleDelete(image.id, image.image_url)}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {FORM_LABELS.deleteButton}
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="truncate font-semibold">{image.title}</h3>
              {!!image.description && (
                <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                  {image.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {(!images || images.length === 0) && (
          <div className="col-span-full rounded-lg border-2 border-dashed py-12 text-center">
            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="font-medium text-lg text-muted-foreground">
              {UI_TEXT.emptyState.heading}
            </h3>
            <p className="text-muted-foreground text-sm">
              {UI_TEXT.emptyState.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
