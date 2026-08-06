import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Users, Activity, ensureSeed, hashPassword, SessionStore, uid,
  type User, type Role,
} from "./storage";

interface AuthCtx {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string, role: Role) => Promise<{ ok: boolean; error?: string; role?: Role }>;
  register: (data: { name: string; email: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string; role?: Role }>;
  logout: () => void;
  refresh: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const loading = useRef(false);

  const hydrate = async () => {
    if (loading.current) return;
    loading.current = true;
    try {
      const session = SessionStore.get();
      if (!session) {
        setUser(null);
        return;
      }
      const u = Users.byId(session.userId);
      setUser(u ?? null);
    } finally {
      loading.current = false;
      setReady(true);
    }
  };

  useEffect(() => {
    void ensureSeed().then(() => hydrate());
  }, []);

  const refresh = () => {
    void hydrate();
  };

  const login: AuthCtx["login"] = async (email, password, role) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return { ok: false, error: "Enter your email and password." };
    const u = Users.byEmail(cleanEmail);
    if (!u) return { ok: false, error: "No account found with that email." };
    const hash = await hashPassword(password);
    if (u.passwordHash !== hash) return { ok: false, error: "Wrong email or password." };
    if (u.role !== role) {
      return { ok: false, error: `This account isn't a ${role === "ADMIN" ? "admin" : "patient"} account.` };
    }
    if (u.status !== "active") {
      return { ok: false, error: "This account is disabled. Contact an administrator." };
    }
    SessionStore.set({ userId: u.id, role: u.role, loggedAt: new Date().toISOString() });
    setUser(u);
    Activity.log(u.id, "LOGIN", "Signed into account");
    return { ok: true, role: u.role };
  };

  const register: AuthCtx["register"] = async ({ name, email, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) return { ok: false, error: "Enter your full name." };
    if (Users.byEmail(cleanEmail)) return { ok: false, error: "An account with that email already exists." };
    const u: User = {
      id: uid(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: await hashPassword(password),
      role: "USER",
      status: "active",
      createdDate: new Date().toISOString(),
    };
    Users.add(u);
    SessionStore.set({ userId: u.id, role: u.role, loggedAt: new Date().toISOString() });
    setUser(u);
    Activity.log(u.id, "REGISTER", "Created account");
    return { ok: true, role: u.role };
  };

  const logout = () => {
    if (user) Activity.log(user.id, "LOGOUT", "Signed out");
    SessionStore.clear();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
