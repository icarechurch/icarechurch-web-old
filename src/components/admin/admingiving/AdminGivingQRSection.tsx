import { ImageUpload } from "@/components/admin/ImageUpload";
import { Label } from "@/shared/components/ui/label";

interface AdminGivingQRSectionProps {
  qrUrl: string;
  onQrUrlChange: (url: string) => void;
}

export const AdminGivingQRSection = ({
  qrUrl,
  onQrUrlChange,
}: AdminGivingQRSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-semibold text-base">GCash QR Code</Label>
        <p className="mt-1 text-muted-foreground text-sm">
          Upload a QR code image that people can scan to send donations via GCash
        </p>
      </div>

      <ImageUpload
        folder="giving"
        imageClassName="h-48 w-full object-contain bg-white p-2 rounded-lg border"
        onChange={onQrUrlChange}
        showInput={false}
        value={qrUrl}
      />
    </div>
  );
};
