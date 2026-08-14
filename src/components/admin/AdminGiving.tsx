import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useToast } from "@/shared/hooks/use-toast";
import { useGivingSettings, useUpdateGivingSettings } from "@/domains/giving/hooks/useGiving";
import { AdminGivingPlatformSection } from "@/components/admin/admingiving/AdminGivingPlatformSection";
import { AdminGivingQRSection } from "@/components/admin/admingiving/AdminGivingQRSection";

export function AdminGiving() {
  const { data: settings, isLoading } = useGivingSettings();
  const updateSettings = useUpdateGivingSettings();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    gcash_qr_url: "",
    donation_platform_name: "",
    donation_platform_url: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        gcash_qr_url: settings.gcash_qr_url || "",
        donation_platform_name: settings.donation_platform_name || "",
        donation_platform_url: settings.donation_platform_url || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        updates: {
          gcash_qr_url: formData.gcash_qr_url || null,
          donation_platform_name:
            formData.donation_platform_name || "Buy Me a Coffee",
          donation_platform_url: formData.donation_platform_url || null,
        },
      });

      toast({
        title: "Success",
        description: "Giving settings updated successfully",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to update giving settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Giving Settings</CardTitle>
          <CardDescription>
            Manage donation options and payment methods for the Giving page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AdminGivingQRSection
            onQrUrlChange={(url) =>
              setFormData({ ...formData, gcash_qr_url: url })
            }
            qrUrl={formData.gcash_qr_url}
          />

          <AdminGivingPlatformSection
            onPlatformNameChange={(value) =>
              setFormData({ ...formData, donation_platform_name: value })
            }
            onPlatformUrlChange={(value) =>
              setFormData({ ...formData, donation_platform_url: value })
            }
            platformName={formData.donation_platform_name}
            platformUrl={formData.donation_platform_url}
          />

          {/* Save Button */}
          <div className="border-t pt-6">
            <Button disabled={updateSettings.isLoading} onClick={handleSave}>
              {updateSettings.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
