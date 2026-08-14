import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthMode = "login" | "signup" | "forgot_password";

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    signIn,
    signUp,
    user,
    isAdmin,
    isModerator,
    loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();

  // Redirect when user is logged in and admin status is determined
  useEffect(() => {
    if (user && !authLoading) {
      if (isAdmin) {
        navigate("/admin");
      } else if (isModerator) {
        navigate("/moderator");
      } else {
        navigate("/");
      }
    }
  }, [user, isAdmin, isModerator, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === "forgot_password") {
        // Forgot Password Flow
        if (!email) {
          toast.error("Please enter your email");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Check your email for the password reset link");
          setAuthMode("login");
        }
      } else {
        // Login / Signup Flow
        const validation = authSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        if (authMode === "login") {
          const { error } = await signIn(email, password);
          if (error) {
            if (error.message.includes("Invalid login credentials")) {
              toast.error("Invalid email or password");
            } else {
              toast.error(error.message);
            }
          } else {
            toast.success("Welcome back!");
          }
        } else {
          const { error } = await signUp(email, password);
          if (error) {
            if (error.message.includes("already registered")) {
              toast.error(
                "This email is already registered. Please sign in instead."
              );
            } else {
              toast.error(error.message);
            }
          } else {
            toast.success(
              "Account created! Please check your email to confirm your account."
            );
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case "login":
        return "Welcome Back";
      case "signup":
        return "Create Account";
      case "forgot_password":
        return "Reset Password";
    }
  };

  const getDescription = () => {
    switch (authMode) {
      case "login":
        return "Sign in to access your account";
      case "signup":
        return "Sign up to get started";
      case "forgot_password":
        return "Enter your email to receive a reset link";
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
                  {getTitle()}
                </CardTitle>
                <CardDescription>{getDescription()}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-1 block font-medium text-sm">
                      Email
                    </label>
                    <Input
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>

                  {authMode !== "forgot_password" && (
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <label className="block font-medium text-sm">
                          Password
                        </label>
                        {authMode === "login" && (
                          <button
                            className="text-primary text-xs hover:underline"
                            onClick={() => setAuthMode("forgot_password")}
                            type="button"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          className="pr-10"
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
                  )}

                  <Button className="w-full" disabled={loading} type="submit">
                    {loading
                      ? "Please wait..."
                      : authMode === "login"
                        ? "Sign In"
                        : authMode === "signup"
                          ? "Sign Up"
                          : "Send Link"}
                  </Button>
                </form>

                <div className="mt-6 space-y-2 text-center">
                  {authMode === "login" && (
                    <button
                      className="text-primary text-sm hover:underline"
                      onClick={() => setAuthMode("signup")}
                      type="button"
                    >
                      Don't have an account? Sign up
                    </button>
                  )}
                  {authMode === "signup" && (
                    <button
                      className="text-primary text-sm hover:underline"
                      onClick={() => setAuthMode("login")}
                      type="button"
                    >
                      Already have an account? Sign in
                    </button>
                  )}
                  {authMode === "forgot_password" && (
                    <button
                      className="text-primary text-sm hover:underline"
                      onClick={() => setAuthMode("login")}
                      type="button"
                    >
                      Back to Sign In
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
