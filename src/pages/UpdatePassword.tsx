import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { profileService } from "@/integrations/supabase/services";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If we land here but aren't authenticated (no recovery session), redirect to auth
    // Supabase auto-recovers the session from the URL hash #access_token=...
    // However, it might take a moment to initialize.

    // Check if we have a hash which indicates a recovery link
    const hash = window.location.hash;
    if (!(hash || user)) {
      // If no user and no hash, likely accessed directly -> Go to login
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      await profileService.updatePassword(password);
      toast.success("Password updated successfully!");
      navigate("/auth");
    } catch {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding flex min-h-[60vh] items-center">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <Card className="border-none shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">
                  Set New Password
                </CardTitle>
                <CardDescription>
                  Enter your new password below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleUpdatePassword}>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        className="pr-10"
                        id="password"
                        minLength={6}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                      />
                      <button
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button className="w-full" disabled={loading} type="submit">
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
