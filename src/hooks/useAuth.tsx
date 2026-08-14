import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "@/infrastructure/supabase/client";
import { authService } from "@/domains/auth/api/auth.api";
import type { Database } from "@/infrastructure/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isModerator: boolean;
  role: AppRole | null;
  roleError: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleError, setRoleError] = useState(false);
  const roleRequestRef = useRef(0);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch role immediately on auth change
        setLoading(true);
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setIsAdmin(false);
        setIsModerator(false);
        setRoleError(false);
        setLoading(false);
      }
    });

    // Initial session check — deduplicated by roleRequestRef
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const requestId = ++roleRequestRef.current;
    try {
      const fetchedRole = await authService.getUserRole(userId);
      // Ignore stale responses from concurrent calls
      if (requestId !== roleRequestRef.current) return;
      setRole(fetchedRole);
      setIsAdmin(fetchedRole === "admin");
      setIsModerator(fetchedRole === "moderator");
      setRoleError(false);
    } catch {
      if (requestId !== roleRequestRef.current) return;
      // Distinguish a network/RLS failure from a user with no role
      setRoleError(true);
      setRole(null);
      setIsAdmin(false);
      setIsModerator(false);
    } finally {
      if (requestId === roleRequestRef.current) {
        setLoading(false);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: new Error("Email and password are required") };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();

    // Explicitly clear any leftover auth data from localStorage
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("sb-") || key?.includes("supabase")) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    }

    setRole(null);
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setIsModerator(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isModerator,
        role,
        roleError,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
