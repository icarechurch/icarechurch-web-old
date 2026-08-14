import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface AdminGivingPlatformSectionProps {
  platformName: string;
  platformUrl: string;
  onPlatformNameChange: (value: string) => void;
  onPlatformUrlChange: (value: string) => void;
}

export const AdminGivingPlatformSection = ({
  platformName,
  platformUrl,
  onPlatformNameChange,
  onPlatformUrlChange,
}: AdminGivingPlatformSectionProps) => {
  return (
    <div className="space-y-4 border-t pt-6">
      <div>
        <Label className="font-semibold text-base">
          Online Donation Platform
        </Label>
        <p className="mt-1 text-muted-foreground text-sm">
          Configure third-party donation platform (e.g., Buy Me a Coffee, Ko-fi,
          etc.)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform-name">Platform Name</Label>
        <Input
          id="platform-name"
          onChange={(e) => onPlatformNameChange(e.target.value)}
          placeholder="e.g., Buy Me a Coffee"
          value={platformName}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform-url">Platform URL</Label>
        <Input
          id="platform-url"
          onChange={(e) => onPlatformUrlChange(e.target.value)}
          placeholder="https://www.buymeacoffee.com/yourchurch"
          type="url"
          value={platformUrl}
        />
        <p className="text-muted-foreground text-xs">
          Enter the full URL where people can donate online
        </p>
      </div>
    </div>
  );
};
