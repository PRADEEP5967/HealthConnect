import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SessionStore, Users, hashPassword, ensureSeed, Activity, uid, type User, type Role } from "./storage";

interface AuthCtx {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string, role: Role) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refresh: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = () => {
    const s = SessionStore.get();
    setUser(s ? Users.byId(s.userId) ?? null : null);
  };

  useEffect(() => {
    ensureSeed().then(() => {
      refresh();
      setReady(true);
    });
    const handler = () => refresh();
    window.addEventListener("hc-storage", handler);
    return () => window.removeEventListener("hc-storage", handler);
  }, []);

  const login: AuthCtx["login"] = async (email, password, role) => {
    const u = Users.byEmail(email);
    if (!u) return { ok: false, error: "No account with that email." };
    if (u.role !== role) return { ok: false, error: `This account isn't a ${role.toLowerCase()} account.` };
    if (u.status !== "active") return { ok: false, error: "This account is disabled." };
    const hash = await hashPassword(password);
    if (hash !== u.passwordHash) return { ok: false, error: "Incorrect password." };
    SessionStore.set({ userId: u.id, role: u.role, loggedAt: new Date().toISOString() });
    Activity.log(u.id, "LOGIN", "Signed into account");
    refresh();
    return { ok: true };
  };

  const register: AuthCtx["register"] = async ({ name, email, password, role }) => {
    if (Users.byEmail(email)) return { ok: false, error: "Email already registered." };
    const u: User = {
      id: uid(),
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
      status: "active",
      createdDate: new Date().toISOString(),
    };
    Users.add(u);
    SessionStore.set({ userId: u.id, role: u.role, loggedAt: new Date().toISOString() });
    Activity.log(u.id, "REGISTER", "Created account");
    refresh();
    return { ok: true };
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
