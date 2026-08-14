import { Download, ExternalLink, MapPin } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/shared/components/layout/Layout";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { GivingHeader } from "@/user/giving/components/GivingHeader";
import { GivingOptionCard } from "@/user/giving/components/GivingOptionCard";
import { GivingQuote } from "@/user/giving/components/GivingQuote";
import { useGivingSettings } from "@/domains/giving/hooks/useGiving";

const Giving = () => {
  const { data: givingSettings, isLoading, error } = useGivingSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load giving options",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleDownloadQR = async () => {
    if (!givingSettings?.gcash_qr_url) return;

    try {
      const response = await fetch(givingSettings.gcash_qr_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gcash-qr-code.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "QR code downloaded successfully",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-primary border-b-2" />
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <GivingHeader />

            {/* Giving Options Grid */}
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-2">
              {/* Left Column: Stacked Options */}
              <div className="space-y-6 md:space-y-8">
                {/* Option 1: Visit the Church */}
                <GivingOptionCard
                  description="Give in person during service"
                  icon={
                    <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  }
                  iconBgColorClass="bg-blue-100 dark:bg-blue-900/30"
                  title="Visit Us"
                >
                  <p className="text-center text-muted-foreground text-sm">
                    Join us for worship and give your offering during our
                    service times. We'd love to see you!
                  </p>
                  <Button
                    className="mt-auto w-full"
                    onClick={() => navigate("/contact")}
                    variant="default"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    View Location & Times
                  </Button>
                </GivingOptionCard>

                {/* Option 2: Online Platform */}
                <GivingOptionCard
                  description="Support us online"
                  icon={
                    <ExternalLink className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  }
                  iconBgColorClass="bg-purple-100 dark:bg-purple-900/30"
                  title={
                    givingSettings?.donation_platform_name || "Online Giving"
                  }
                >
                  <p className="text-center text-muted-foreground text-sm">
                    Give securely through our online donation platform. Every
                    contribution makes a difference!
                  </p>
                  {givingSettings?.donation_platform_url ? (
                    <Button
                      className="mt-auto w-full"
                      onClick={() => {
                        const url = givingSettings.donation_platform_url!;
                        if (!url.startsWith("https://")) return;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      variant="default"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Give Online
                    </Button>
                  ) : (
                    <Button
                      className="mt-auto w-full"
                      disabled
                      variant="outline"
                    >
                      Coming Soon
                    </Button>
                  )}
                </GivingOptionCard>
              </div>

              {/* Right Column: GCash QR Code */}
              <GivingOptionCard
                className="lg:min-h-[600px] border-primary/50 justify-center"
                description="Scan or download QR code"
                icon={
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                  </svg>
                }
                iconBgColorClass="bg-green-100 dark:bg-green-900/30"
                title="GCash"
              >
                {givingSettings?.gcash_qr_url ? (
                  <>
                    <div className="flex flex-1 items-center justify-center rounded-lg bg-white p-4">
                      <img
                        alt="GCash QR Code"
                        className="h-full max-h-[400px] w-full object-contain"
                        src={givingSettings.gcash_qr_url}
                      />
                    </div>
                    <Button
                      className="mt-auto w-full"
                      onClick={handleDownloadQR}
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-lg bg-muted p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      GCash QR code will be available soon
                    </p>
                  </div>
                )}
              </GivingOptionCard>
            </div>

            <GivingQuote />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Giving;
