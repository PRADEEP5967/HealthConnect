// Runtime schema validation + automatic repair/backup for the LocalStorage layer.
// Corrupted or partially written entries are quarantined into a timestamped
// backup key so nothing is silently lost, then the store is repaired in place.

import { z } from "zod";

const iso = z.string().min(1);

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().min(1),
  passwordHash: z.string(),
  role: z.enum(["ADMIN", "USER"]),
  status: z.enum(["active", "inactive"]).catch("active"),
  age: z.number().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  bloodGroup: z.string().optional(),
  createdDate: iso.catch(() => new Date().toISOString()),
});

export const metricSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(["bp", "sugar", "weight", "heart", "bmi"]),
  systolic: z.number().optional(),
  diastolic: z.number().optional(),
  value: z.number().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
  date: iso,
});

export const recordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  category: z.string().catch("General"),
  notes: z.string().catch(""),
  adminNotes: z.string().optional(),
  date: iso,
});

export const medicationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  dosage: z.string().catch(""),
  frequency: z.string().catch(""),
  time: z.string().catch(""),
  reminder: z.boolean().catch(false),
  startDate: iso,
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export const appointmentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  doctor: z.string().min(1),
  specialty: z.string().catch(""),
  location: z.string().catch(""),
  date: iso,
  time: z.string().catch(""),
  status: z.enum(["Pending", "Approved", "Completed", "Cancelled"]).catch("Pending"),
  notes: z.string().optional(),
});

export const documentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  type: z.string().catch(""),
  size: z.number().catch(0),
  // A partially written Base64 upload is the most common corruption source.
  dataUrl: z.string().refine((v) => v.startsWith("data:") && v.includes(","), {
    message: "dataUrl is not a complete data URL",
  }),
  category: z.string().catch("General"),
  uploadDate: iso,
});

export const fitnessSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  activity: z.string().min(1),
  duration: z.number().catch(0),
  calories: z.number().catch(0),
  steps: z.number().optional(),
  date: iso,
});

export const nutritionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  meal: z.string().catch(""),
  food: z.string().min(1),
  calories: z.number().catch(0),
  date: iso,
});

export const sleepSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  hours: z.number().catch(0),
  quality: z.number().catch(3),
  date: iso,
});

export const emergencySchema = z.object({
  userId: z.string().min(1),
  bloodGroup: z.string().catch(""),
  allergies: z.string().catch(""),
  conditions: z.string().catch(""),
  medications: z.string().catch(""),
  contactName: z.string().catch(""),
  contactPhone: z.string().catch(""),
  contactRelation: z.string().catch(""),
  verifiedByAdmin: z.boolean().optional(),
});

export const activitySchema = z.object({
  id: z.string().min(1),
  userId: z.string().catch(""),
  userName: z.string().optional(),
  activity: z.string().min(1),
  description: z.string().catch(""),
  timestamp: iso,
});

export const notificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().catch(""),
  audience: z.string().catch("all"),
  createdAt: iso,
  read: z.record(z.boolean()).optional(),
});

export const articleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().catch("General"),
  content: z.string().catch(""),
  published: z.boolean().catch(false),
  createdAt: iso,
});

export const settingsSchema = z.object({
  appName: z.string().catch("MediPulse"),
  tagline: z.string().catch(""),
  defaultTheme: z.enum(["light", "dark"]).catch("light"),
  categories: z.array(z.string()).catch([]),
  notificationsEnabled: z.boolean().catch(true),
});

export const sessionSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "USER"]),
  loggedAt: iso,
});

type Kind = "list" | "object" | "nullable-object";

interface KeySpec {
  schema: z.ZodTypeAny;
  kind: Kind;
  label: string;
}

/** Schema registry keyed by the raw localStorage key. */
export const SCHEMA_REGISTRY: Record<string, KeySpec> = {
  hc_users: { schema: userSchema, kind: "list", label: "Users" },
  hc_session: { schema: sessionSchema, kind: "nullable-object", label: "Session" },
  hc_health_metrics: { schema: metricSchema, kind: "list", label: "Health metrics" },
  hc_health_records: { schema: recordSchema, kind: "list", label: "Health records" },
  hc_medications: { schema: medicationSchema, kind: "list", label: "Medications" },
  hc_appointments: { schema: appointmentSchema, kind: "list", label: "Appointments" },
  hc_medical_documents: { schema: documentSchema, kind: "list", label: "Medical documents" },
  hc_fitness_logs: { schema: fitnessSchema, kind: "list", label: "Fitness logs" },
  hc_nutrition_logs: { schema: nutritionSchema, kind: "list", label: "Nutrition logs" },
  hc_sleep_logs: { schema: sleepSchema, kind: "list", label: "Sleep logs" },
  hc_emergency: { schema: emergencySchema, kind: "list", label: "Emergency profiles" },
  hc_activity_logs: { schema: activitySchema, kind: "list", label: "Activity logs" },
  hc_notifications: { schema: notificationSchema, kind: "list", label: "Notifications" },
  hc_articles: { schema: articleSchema, kind: "list", label: "Articles" },
  hc_system_settings: { schema: settingsSchema, kind: "object", label: "System settings" },
};

export const BACKUP_PREFIX = "hc_corrupt_backup:";
export const REPAIR_LOG_KEY = "hc_repair_log";
const MAX_BACKUPS = 20;
const MAX_REPAIR_LOG = 50;

export interface RepairEntry {
  key: string;
  label: string;
  reason: "unparsable" | "wrong-shape" | "invalid-items";
  removed: number;
  kept: number;
  backupKey: string | null;
  at: string;
}

const isBrowser = () => typeof window !== "undefined";

function quarantine(key: string, raw: string): string | null {
  try {
    const backupKey = `${BACKUP_PREFIX}${key}:${Date.now()}`;
    localStorage.setItem(backupKey, raw);
    pruneBackups();
    return backupKey;
  } catch {
    return null; // quota exhausted — repair still proceeds
  }
}

function pruneBackups() {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(BACKUP_PREFIX)) keys.push(k);
  }
  keys.sort();
  while (keys.length > MAX_BACKUPS) {
    const oldest = keys.shift();
    if (oldest) localStorage.removeItem(oldest);
  }
}

function logRepairs(entries: RepairEntry[]) {
  if (!entries.length) return;
  try {
    const prev = JSON.parse(localStorage.getItem(REPAIR_LOG_KEY) ?? "[]");
    const next = [...entries, ...(Array.isArray(prev) ? prev : [])].slice(0, MAX_REPAIR_LOG);
    localStorage.setItem(REPAIR_LOG_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getRepairLog(): RepairEntry[] {
  if (!isBrowser()) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(REPAIR_LOG_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as RepairEntry[]) : [];
  } catch {
    return [];
  }
}

export function listBackups(): { key: string; sourceKey: string; at: string; size: number }[] {
  if (!isBrowser()) return [];
  const out: { key: string; sourceKey: string; at: string; size: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(BACKUP_PREFIX)) continue;
    const rest = k.slice(BACKUP_PREFIX.length);
    const idx = rest.lastIndexOf(":");
    const sourceKey = rest.slice(0, idx);
    const ts = Number(rest.slice(idx + 1));
    out.push({
      key: k,
      sourceKey,
      at: Number.isFinite(ts) ? new Date(ts).toISOString() : "",
      size: (localStorage.getItem(k) ?? "").length,
    });
  }
  return out.sort((a, b) => (a.at < b.at ? 1 : -1));
}

/**
 * Validate one key and repair it in place. Returns a repair entry when the
 * stored value was corrupted, otherwise null.
 */
export function validateAndRepairKey(key: string): RepairEntry | null {
  if (!isBrowser()) return null;
  const spec = SCHEMA_REGISTRY[key];
  if (!spec) return null;

  const raw = localStorage.getItem(key);
  if (raw === null) return null;

  const now = new Date().toISOString();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Truncated / partially written JSON.
    const backupKey = quarantine(key, raw);
    localStorage.removeItem(key);
    return { key, label: spec.label, reason: "unparsable", removed: 1, kept: 0, backupKey, at: now };
  }

  if (spec.kind === "list") {
    if (!Array.isArray(parsed)) {
      const backupKey = quarantine(key, raw);
      localStorage.setItem(key, "[]");
      return { key, label: spec.label, reason: "wrong-shape", removed: 1, kept: 0, backupKey, at: now };
    }
    const kept: unknown[] = [];
    let removed = 0;
    for (const item of parsed) {
      const res = spec.schema.safeParse(item);
      if (res.success) kept.push(res.data);
      else removed++;
    }
    if (removed === 0) return null;
    const backupKey = quarantine(key, raw);
    localStorage.setItem(key, JSON.stringify(kept));
    return { key, label: spec.label, reason: "invalid-items", removed, kept: kept.length, backupKey, at: now };
  }

  if (spec.kind === "nullable-object" && parsed === null) return null;

  const res = spec.schema.safeParse(parsed);
  if (res.success) {
    // `.catch()` defaults may have healed fields — persist the normalized value.
    const normalized = JSON.stringify(res.data);
    if (normalized !== raw) localStorage.setItem(key, normalized);
    return null;
  }
  const backupKey = quarantine(key, raw);
  if (spec.kind === "nullable-object") localStorage.setItem(key, "null");
  else localStorage.removeItem(key); // falls back to defaults on next read
  return { key, label: spec.label, reason: "wrong-shape", removed: 1, kept: 0, backupKey, at: now };
}

/** Validate + repair every known key. Safe to call repeatedly. */
export function runIntegrityCheck(): RepairEntry[] {
  if (!isBrowser()) return [];
  const repairs: RepairEntry[] = [];
  for (const key of Object.keys(SCHEMA_REGISTRY)) {
    try {
      const r = validateAndRepairKey(key);
      if (r) repairs.push(r);
    } catch {
      /* never let integrity checking break the app */
    }
  }
  if (repairs.length) {
    logRepairs(repairs);
    window.dispatchEvent(new CustomEvent("hc-repaired", { detail: { repairs } }));
    window.dispatchEvent(new CustomEvent("hc-storage", { detail: { key: "*" } }));
  }
  return repairs;
}

/** Restore a quarantined payload back into its original key (best effort). */
export function restoreBackup(backupKey: string): boolean {
  if (!isBrowser()) return false;
  const raw = localStorage.getItem(backupKey);
  if (!raw) return false;
  const rest = backupKey.slice(BACKUP_PREFIX.length);
  const sourceKey = rest.slice(0, rest.lastIndexOf(":"));
  if (!SCHEMA_REGISTRY[sourceKey]) return false;
  localStorage.setItem(sourceKey, raw);
  validateAndRepairKey(sourceKey);
  window.dispatchEvent(new CustomEvent("hc-storage", { detail: { key: sourceKey } }));
  return true;
}

export function deleteBackup(backupKey: string) {
  if (isBrowser()) localStorage.removeItem(backupKey);
}

export function clearRepairLog() {
  if (isBrowser()) localStorage.removeItem(REPAIR_LOG_KEY);
}
