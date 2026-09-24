export interface GivingSettings {
  id: string;
  gcash_qr_url: string | null;
  donation_platform_name: string;
  donation_platform_url: string | null;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_GIVING_SETTINGS: Partial<GivingSettings> = {
  donation_platform_name: "Buy Me a Coffee",
};
