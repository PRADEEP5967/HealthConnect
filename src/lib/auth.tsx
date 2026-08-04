import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Activity, ensureSeed, type User, type Role } from "./storage";
import { mapProfile, syncDirectory } from "./cloud";

interface AuthCtx {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string, role: Role) => Promise<{ ok: boolean; error?: string; role?: Role }>;
  register: (data: { name: string; email: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refresh: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

async function loadCurrentUser(userId: string, retries = 0): Promise<User | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    if (profile) {
      const role: Role = (roles ?? []).some((r) => r.role === "admin") ? "ADMIN" : "USER";
      return mapProfile(profile, role);
    }
    // The signup trigger creates the profile asynchronously — wait and retry.
    if (attempt < retries) await new Promise((r) => setTimeout(r, 400));
  }
  return null;
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "Confirm your email address, then sign in.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Sign in instead.";
  if (m.includes("password") && m.includes("6")) return "Password must be at least 6 characters.";
  if (m.includes("pwned") || m.includes("compromised") || m.includes("weak"))
    return "That password has appeared in a data breach. Pick a stronger one.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const loading = useRef(false);

  const hydrate = async () => {
    if (loading.current) return;
    loading.current = true;
    try {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user.id;
      if (!id) {
        setUser(null);
        return;
      }
      const u = await loadCurrentUser(id);
      setUser(u);
      if (u) await syncDirectory();
    } catch (e) {
      // A backend hiccup must never blank the app — fall back to signed-out.
      console.warn("[auth] session hydrate failed", e);
      setUser(null);
    } finally {
      loading.current = false;
      setReady(true);
    }
  };

  useEffect(() => {
    // Local demo health data still seeds for the current device.
    void ensureSeed()
      .then(() => hydrate())
      .catch(() => setReady(true));
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
          void hydrate();
        }
      });
      return () => sub.subscription.unsubscribe();
    } catch (e) {
      console.warn("[auth] could not subscribe to auth changes", e);
      setReady(true);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const refresh = () => {
    void hydrate();
  };

  const login: AuthCtx["login"] = async (email, password, role) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "Could not sign in." };
    }
    const u = await loadCurrentUser(data.user.id);
    if (!u) {
      await supabase.auth.signOut();
      return { ok: false, error: "Profile not found for this account." };
    }
    void role; // the tab is only a hint; the account's real role decides where you land
    if (u.status !== "active") {
      await supabase.auth.signOut();
      return { ok: false, error: "This account is disabled. Contact an administrator." };
    }
    setUser(u);
    await syncDirectory();
    Activity.log(u.id, "LOGIN", "Signed into account");
    return { ok: true, role: u.role };
  };

  const register: AuthCtx["register"] = async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.session) {
      return { ok: false, error: "Check your email to confirm your account, then sign in." };
    }
    const u = await loadCurrentUser(data.user!.id);
    setUser(u);
    if (u) {
      await syncDirectory();
      Activity.log(u.id, "REGISTER", "Created account");
    }
    return { ok: true };
  };

  const logout = () => {
    if (user) Activity.log(user.id, "LOGOUT", "Signed out");
    void supabase.auth.signOut().then(() => {
      Users.replaceAll([]);
      setUser(null);
    });
  };

  return <Ctx.Provider value={{ user, ready, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
