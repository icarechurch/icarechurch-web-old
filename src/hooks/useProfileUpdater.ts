import { useState } from "react";
import { toast } from "sonner";
import { profileService } from "@/integrations/supabase/services";

export function useProfileUpdater(userId: string | undefined) {
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const updateProfile = async (fullName: string) => {
    if (!userId) return;
    try {
      setUpdatingProfile(true);
      await profileService.updateProfile({ id: userId, full_name: fullName });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const updatePassword = async (
    newPassword: string,
    confirmPassword: string,
    onSuccess?: () => void,
  ) => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setUpdatingPassword(true);
      await profileService.updatePassword(newPassword);
      toast.success("Password updated successfully!");
      onSuccess?.();
    } catch {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return { updateProfile, updatePassword, updatingProfile, updatingPassword };
}
