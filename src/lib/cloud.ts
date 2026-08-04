// Cloud-backed account directory. Profiles, roles and activity live in the
// database so accounts work on any device; they are mirrored into the local
// store so existing screens keep reading through `Users` / `Activity`.
import { supabase } from "@/integrations/supabase/client";
import { Users, Activity, type User, type ActivityLog, type Role } from "./storage";

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  status: string;
  created_at: string;
}

/** True when the browser bundle actually received the backend config. */
function cloudConfigured(): boolean {
  const env = import.meta.env as Record<string, string | undefined>;
  return Boolean(
    (env['VITE_SUPABASE_URL'] || env['SUPABASE_URL']) &&
      (env['VITE_SUPABASE_PUBLISHABLE_KEY'] ||
        env['VITE_SUPABASE_ANON_KEY'] ||
        env['SUPABASE_PUBLISHABLE_KEY']),
  );
}

/** Never let a backend/network hiccup surface as an uncaught promise rejection. */
async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!cloudConfigured()) {
    console.warn(`[cloud] skipped ${label}: backend not configured in this build`);
    return fallback;
  }
  try {
    return await fn();
  } catch (e) {
    console.warn(`[cloud] ${label} failed`, e);
    return fallback;
  }
}

export function mapProfile(p: ProfileRow, role: Role): User {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    passwordHash: "",
    role,
    status: p.status === "inactive" ? "inactive" : "active",
    age: p.age ?? undefined,
    gender: p.gender ?? undefined,
    phone: p.phone ?? undefined,
    bloodGroup: p.blood_group ?? undefined,
    createdDate: p.created_at,
  };
}

export async function fetchDirectory(): Promise<{ users: User[]; logs: ActivityLog[] }> {
  return safe("fetchDirectory", () => fetchDirectoryInner(), { users: [], logs: [] });
}

async function fetchDirectoryInner(): Promise<{ users: User[]; logs: ActivityLog[] }> {
  const [profiles, roles, logs] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(500),
  ]);

  const roleMap = new Map<string, Role>();
  (roles.data ?? []).forEach((r) => {
    if (r.role === "admin") roleMap.set(r.user_id, "ADMIN");
    else if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, "USER");
  });

  return {
    users: ((profiles.data ?? []) as ProfileRow[]).map((p) => mapProfile(p, roleMap.get(p.id) ?? "USER")),
    logs: (logs.data ?? []).map((l) => ({
      id: l.id,
      userId: l.user_id ?? "",
      userName: l.user_name ?? undefined,
      activity: l.activity,
      description: l.description,
      timestamp: l.created_at,
    })),
  };
}

/** Pull the cloud directory into the local mirror so all screens see it. */
export async function syncDirectory(): Promise<void> {
  const { users, logs } = await fetchDirectory();
  if (users.length === 0 && logs.length === 0) return;
  Users.replaceAll(users);
  Activity.replaceAll(logs);
}


type ProfileUpdate = Partial<{
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  status: string;
}>;

export async function pushProfileUpdate(id: string, patch: Partial<User>): Promise<void> {
  const row: ProfileUpdate = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone ?? null;
  if (patch.age !== undefined) row.age = patch.age ?? null;
  if (patch.gender !== undefined) row.gender = patch.gender ?? null;
  if (patch.bloodGroup !== undefined) row.blood_group = patch.bloodGroup ?? null;
  if (patch.status !== undefined) row.status = patch.status;
  if (Object.keys(row).length === 0) return;
  await safe("profile update", async () => {
    const { error } = await supabase.from("profiles").update(row).eq("id", id);
    if (error) console.warn("[cloud] profile update failed", error.message);
  }, undefined);
}


export async function deleteProfileRemote(id: string): Promise<void> {
  await safe("profile delete", async () => {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) console.warn("[cloud] profile delete failed", error.message);
  }, undefined);
}

export async function logActivityRemote(
  userId: string,
  userName: string | undefined,
  activity: string,
  description: string,
): Promise<void> {
  await safe("activity insert", async () => {
    const { data } = await supabase.auth.getSession();
    const authId = data.session?.user.id;
    // RLS only allows inserting activity for yourself.
    if (!authId || authId !== userId) return;
    const { error } = await supabase
      .from("activity_logs")
      .insert({ user_id: userId, user_name: userName ?? null, activity, description });
    if (error) console.warn("[cloud] activity insert failed", error.message);
  }, undefined);
}

export async function clearActivityRemote(): Promise<void> {
  await safe("activity clear", async () => {
    const { error } = await supabase.from("activity_logs").delete().not("id", "is", null);
    if (error) console.warn("[cloud] activity clear failed", error.message);
  }, undefined);
}
