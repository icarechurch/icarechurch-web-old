import { Eye, EyeOff, Loader2, Lock, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Layout } from "@/shared/components/layout/Layout";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { useProfileUpdater } from "@/domains/auth/hooks/useProfileUpdater";
import { profileService } from "@/integrations/supabase/services";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { updateProfile, updatePassword, updatingProfile, updatingPassword } =
    useProfileUpdater(user?.id);

  // Profile State
  const [fullName, setFullName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    getProfile();
  }, [user, navigate]);

  const getProfile = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoadingProfile(true);
      const data = await profileService.getProfile(user.id);

      if (data.full_name) {
        setFullName(data.full_name);
      }
    } catch {
      toast.error("Error loading user profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(fullName);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePassword(newPassword, confirmPassword, () => {
      setNewPassword("");
      setConfirmPassword("");
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      toast.success("Signed out successfully");
    } catch {
      toast.error("Error signing out");
    }
  };

  if (loadingProfile) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding min-h-[80vh] bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-center font-bold font-display text-3xl">
            Account Settings
          </h1>

          <div className="mx-auto grid max-w-2xl gap-8">
            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleUpdateProfile}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      className="bg-muted"
                      disabled
                      id="email"
                      value={user?.email || ""}
                    />
                    <p className="text-muted-foreground text-xs">
                      Email cannot be changed.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      value={fullName}
                    />
                  </div>
                  <Button disabled={updatingProfile} type="submit">
                    {updatingProfile && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Update Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleUpdatePassword}>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        className="pr-10"
                        id="newPassword"
                        minLength={6}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                      />
                      <button
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        type="button"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        className="pr-10"
                        id="confirmPassword"
                        minLength={6}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                      />
                      <button
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        type="button"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    disabled={updatingPassword}
                    type="submit"
                    variant="outline"
                  >
                    {updatingPassword && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
            {/* Account Actions Card */}
            <Card className="border-destructive/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-destructive">
                    Account Actions
                  </CardTitle>
                </div>
                <CardDescription>Manage your account session.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleSignOut}
                  variant="destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
