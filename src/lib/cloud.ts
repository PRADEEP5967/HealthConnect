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
  try {
    const { users, logs } = await fetchDirectory();
    Users.replaceAll(users);
    Activity.replaceAll(logs);
  } catch (e) {
    console.error("[cloud] directory sync failed", e);
  }
}

const PROFILE_COLUMNS: Record<string, string> = {
  name: "name",
  email: "email",
  phone: "phone",
  age: "age",
  gender: "gender",
  bloodGroup: "blood_group",
  status: "status",
};

export async function pushProfileUpdate(id: string, patch: Partial<User>): Promise<void> {
  const row: Record<string, unknown> = {};
  Object.entries(patch).forEach(([k, v]) => {
    const col = PROFILE_COLUMNS[k];
    if (col) row[col] = v;
  });
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("profiles").update(row).eq("id", id);
  if (error) console.error("[cloud] profile update failed", error.message);
}

export async function deleteProfileRemote(id: string): Promise<void> {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) console.error("[cloud] profile delete failed", error.message);
}

export async function logActivityRemote(
  userId: string,
  userName: string | undefined,
  activity: string,
  description: string,
): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const authId = data.session?.user.id;
  // RLS only allows inserting activity for yourself.
  if (!authId || authId !== userId) return;
  const { error } = await supabase
    .from("activity_logs")
    .insert({ user_id: userId, user_name: userName ?? null, activity, description });
  if (error) console.error("[cloud] activity insert failed", error.message);
}

export async function clearActivityRemote(): Promise<void> {
  const { error } = await supabase.from("activity_logs").delete().not("id", "is", null);
  if (error) console.error("[cloud] activity clear failed", error.message);
}
