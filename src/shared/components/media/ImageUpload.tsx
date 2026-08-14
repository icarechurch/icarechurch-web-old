import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { storageService } from "@/integrations/supabase/services";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  showInput?: boolean;
  imageClassName?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "general",
  showInput = true,
  imageClassName = "h-32 w-full rounded-md border object-cover",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const { publicUrl } = await storageService.uploadImage({
        file,
        bucket: "church-images",
        folder,
      });

      onChange(publicUrl);
      toast.success("Image uploaded");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <input
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        ref={fileInputRef}
        type="file"
      />

      {value ? (
        <div className="group relative">
          <img
            alt="Preview"
            className={imageClassName}
            src={value}
          />
          <Button
            className="absolute top-2 right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleRemove}
            size="icon"
            type="button"
            variant="destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted-foreground/25 border-dashed transition-colors hover:border-primary/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Click to upload</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          size="sm"
          type="button"
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {showInput && (
        <Input
          className="text-xs"
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL"
          value={value}
        />
      )}
    </div>
  );
}
