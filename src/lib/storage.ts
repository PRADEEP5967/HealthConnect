// LocalStorage-backed data layer. All access should go through helpers here.
// SSR-safe: returns defaults when window is undefined.
import { validateAndRepairKey, runIntegrityCheck } from "./schema";

export { runIntegrityCheck };


export type Role = "ADMIN" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: "active" | "inactive";
  age?: number;
  gender?: string;
  phone?: string;
  bloodGroup?: string;
  createdDate: string;
}

export interface HealthMetric {
  id: string;
  userId: string;
  type: "bp" | "sugar" | "weight" | "heart" | "bmi";
  systolic?: number;
  diastolic?: number;
  value?: number;
  unit?: string;
  note?: string;
  date: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  title: string;
  category: string;
  notes: string;
  adminNotes?: string;
  date: string;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  reminder: boolean;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  doctor: string;
  specialty: string;
  location: string;
  date: string;
  time: string;
  status: "Pending" | "Approved" | "Completed" | "Cancelled";
  notes?: string;
}

export interface MedicalDocument {
  id: string;
  userId: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  category: string;
  uploadDate: string;
}

export interface FitnessLog {
  id: string;
  userId: string;
  activity: string;
  duration: number; // minutes
  calories: number;
  steps?: number;
  date: string;
}

export interface NutritionLog {
  id: string;
  userId: string;
  meal: string;
  food: string;
  calories: number;
  date: string;
}

export interface SleepLog {
  id: string;
  userId: string;
  hours: number;
  quality: number; // 1-5
  date: string;
}

export interface EmergencyProfile {
  userId: string;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  medications: string;
  contactName: string;
  contactPhone: string;
  contactRelation: string;
  verifiedByAdmin?: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  activity: string;
  description: string;
  timestamp: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  audience: "all" | string; // "all" or userId
  createdAt: string;
  read?: Record<string, boolean>;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export interface SystemSettings {
  appName: string;
  tagline: string;
  defaultTheme: "light" | "dark";
  categories: string[];
  notificationsEnabled: boolean;
}

export interface Session {
  userId: string;
  role: Role;
  loggedAt: string;
}

export interface HealthGoal {
  id: string;
  userId: string;
  type: "steps" | "sleep" | "water" | "exercise" | "calories";
  target: number;
  unit: string;
  createdAt: string;
}

const KEYS = {
  users: "hc_users",
  session: "hc_session",
  metrics: "hc_health_metrics",
  records: "hc_health_records",
  medications: "hc_medications",
  appointments: "hc_appointments",
  documents: "hc_medical_documents",
  fitness: "hc_fitness_logs",
  nutrition: "hc_nutrition_logs",
  sleep: "hc_sleep_logs",
  emergency: "hc_emergency",
  activity: "hc_activity_logs",
  notifications: "hc_notifications",
  articles: "hc_articles",
  settings: "hc_system_settings",
  goals: "hc_health_goals",
  seeded: "hc_seeded_v1",
} as const;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupted / partially written payload: quarantine + repair, then retry once.
    try {
      validateAndRepairKey(key);
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota / serialization failure would leave a truncated value behind.
    validateAndRepairKey(key);
    return;
  }
  window.dispatchEvent(new CustomEvent("hc-storage", { detail: { key } }));
}


export const uid = () =>
  isBrowser() && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export async function hashPassword(pw: string): Promise<string> {
  if (!isBrowser()) return pw;
  const data = new TextEncoder().encode(pw);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generic list helpers
function list<T>(key: string): T[] {
  return read<T[]>(key, []);
}
function saveList<T>(key: string, arr: T[]) {
  write(key, arr);
}
function add<T extends { id: string }>(key: string, item: T): T {
  const arr = list<T>(key);
  arr.unshift(item);
  saveList(key, arr);
  return item;
}
function update<T extends { id: string }>(key: string, id: string, patch: Partial<T>) {
  const arr = list<T>(key);
  const idx = arr.findIndex((x) => x.id === id);
  if (idx >= 0) {
    arr[idx] = { ...arr[idx], ...patch };
    saveList(key, arr);
  }
}
function remove<T extends { id: string }>(key: string, id: string) {
  saveList<T>(key, list<T>(key).filter((x) => x.id !== id));
}

// Users
export const Users = {
  all: () => list<User>(KEYS.users),
  byId: (id: string) => Users.all().find((u) => u.id === id),
  byEmail: (email: string) => Users.all().find((u) => u.email.toLowerCase() === email.toLowerCase()),
  add: (u: User) => add(KEYS.users, u),
  replaceAll: (arr: User[]) => saveList<User>(KEYS.users, arr),
  update: (id: string, patch: Partial<User>) => {
    update<User>(KEYS.users, id, patch);
  },
  remove: (id: string) => {
    remove<User>(KEYS.users, id);
  },
};


// Session
export const SessionStore = {
  get: () => read<Session | null>(KEYS.session, null),
  set: (s: Session | null) => write(KEYS.session, s),
  clear: () => write(KEYS.session, null),
};

export const Metrics = {
  all: () => list<HealthMetric>(KEYS.metrics),
  forUser: (uid: string) => Metrics.all().filter((m) => m.userId === uid),
  add: (m: HealthMetric) => add(KEYS.metrics, m),
  remove: (id: string) => remove<HealthMetric>(KEYS.metrics, id),
};

export const Records = {
  all: () => list<HealthRecord>(KEYS.records),
  forUser: (uid: string) => Records.all().filter((m) => m.userId === uid),
  add: (m: HealthRecord) => add(KEYS.records, m),
  update: (id: string, p: Partial<HealthRecord>) => update<HealthRecord>(KEYS.records, id, p),
  remove: (id: string) => remove<HealthRecord>(KEYS.records, id),
};

export const Medications = {
  all: () => list<Medication>(KEYS.medications),
  forUser: (uid: string) => Medications.all().filter((m) => m.userId === uid),
  add: (m: Medication) => add(KEYS.medications, m),
  update: (id: string, p: Partial<Medication>) => update<Medication>(KEYS.medications, id, p),
  remove: (id: string) => remove<Medication>(KEYS.medications, id),
};

export const Appointments = {
  all: () => list<Appointment>(KEYS.appointments),
  forUser: (uid: string) => Appointments.all().filter((m) => m.userId === uid),
  add: (m: Appointment) => add(KEYS.appointments, m),
  update: (id: string, p: Partial<Appointment>) => update<Appointment>(KEYS.appointments, id, p),
  remove: (id: string) => remove<Appointment>(KEYS.appointments, id),
};

export const Documents = {
  all: () => list<MedicalDocument>(KEYS.documents),
  forUser: (uid: string) => Documents.all().filter((m) => m.userId === uid),
  add: (m: MedicalDocument) => add(KEYS.documents, m),
  remove: (id: string) => remove<MedicalDocument>(KEYS.documents, id),
};

export const Fitness = {
  all: () => list<FitnessLog>(KEYS.fitness),
  forUser: (uid: string) => Fitness.all().filter((m) => m.userId === uid),
  add: (m: FitnessLog) => add(KEYS.fitness, m),
  remove: (id: string) => remove<FitnessLog>(KEYS.fitness, id),
};

export const Nutrition = {
  all: () => list<NutritionLog>(KEYS.nutrition),
  forUser: (uid: string) => Nutrition.all().filter((m) => m.userId === uid),
  add: (m: NutritionLog) => add(KEYS.nutrition, m),
  remove: (id: string) => remove<NutritionLog>(KEYS.nutrition, id),
};

export const Sleep = {
  all: () => list<SleepLog>(KEYS.sleep),
  forUser: (uid: string) => Sleep.all().filter((m) => m.userId === uid),
  add: (m: SleepLog) => add(KEYS.sleep, m),
  remove: (id: string) => remove<SleepLog>(KEYS.sleep, id),
};

export const Emergency = {
  all: () => list<EmergencyProfile>(KEYS.emergency),
  forUser: (uid: string) => Emergency.all().find((m) => m.userId === uid),
  save: (p: EmergencyProfile) => {
    const arr = Emergency.all();
    const idx = arr.findIndex((x) => x.userId === p.userId);
    if (idx >= 0) arr[idx] = p;
    else arr.unshift(p);
    saveList(KEYS.emergency, arr);
  },
};

export const Activity = {
  all: () => list<ActivityLog>(KEYS.activity),
  replaceAll: (arr: ActivityLog[]) => saveList<ActivityLog>(KEYS.activity, arr),
  log: (
    userId: string,
    activity: string,
    description: string,
    deviceInfo?: { deviceType?: string; browser?: string; os?: string; ipAddress?: string; location?: string },
  ) => {
    const user = Users.byId(userId);
    add<ActivityLog>(KEYS.activity, {
      id: uid(),
      userId,
      userName: user?.name,
      activity,
      description,
      timestamp: new Date().toISOString(),
      deviceType: deviceInfo?.deviceType,
      browser: deviceInfo?.browser,
      os: deviceInfo?.os,
      ipAddress: deviceInfo?.ipAddress,
      location: deviceInfo?.location,
    });
  },
  clear: () => {
    saveList<ActivityLog>(KEYS.activity, []);
  },
};


export const Notifications = {
  all: () => list<Notification>(KEYS.notifications),
  forUser: (uid: string) =>
    Notifications.all().filter((n) => n.audience === "all" || n.audience === uid),
  add: (n: Notification) => add(KEYS.notifications, n),
  remove: (id: string) => remove<Notification>(KEYS.notifications, id),
  markRead: (id: string, userId: string) => {
    const arr = list<Notification>(KEYS.notifications);
    const idx = arr.findIndex((n) => n.id === id);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], read: { ...(arr[idx].read ?? {}), [userId]: true } };
      saveList(KEYS.notifications, arr);
    }
  },
  unreadCount: (uid: string) =>
    Notifications.forUser(uid).filter((n) => !n.read?.[uid]).length,
};

export const Articles = {
  all: () => list<Article>(KEYS.articles),
  published: () => Articles.all().filter((a) => a.published),
  add: (a: Article) => add(KEYS.articles, a),
  update: (id: string, p: Partial<Article>) => update<Article>(KEYS.articles, id, p),
  remove: (id: string) => remove<Article>(KEYS.articles, id),
};

const defaultSettings: SystemSettings = {
  appName: "MediPulse",
  tagline: "Your personal health companion",
  defaultTheme: "light",
  categories: ["General", "Cardiology", "Diabetes", "Nutrition", "Fitness", "Mental Health"],
  notificationsEnabled: true,
};

export const Settings = {
  get: () => read<SystemSettings>(KEYS.settings, defaultSettings),
  save: (s: SystemSettings) => write(KEYS.settings, s),
};

export const Goals = {
  all: () => list<HealthGoal>(KEYS.goals),
  forUser: (uid: string) => Goals.all().filter((g) => g.userId === uid),
  add: (g: HealthGoal) => add(KEYS.goals, g),
  update: (id: string, p: Partial<HealthGoal>) => update<HealthGoal>(KEYS.goals, id, p),
  remove: (id: string) => remove<HealthGoal>(KEYS.goals, id),
};

// Backup
export function exportBackup() {
  const data: Record<string, unknown> = {};
  Object.entries(KEYS).forEach(([k, key]) => {
    if (k === "seeded") return;
    data[k] = read(key, null);
  });
  return data;
}
export function importBackup(data: Record<string, unknown>) {
  Object.entries(KEYS).forEach(([k, key]) => {
    if (k === "seeded") return;
    if (k in data) write(key, data[k]);
  });
  // Imported payloads are untrusted — validate and repair right away.
  runIntegrityCheck();
}

// Seed default admin & sample data
export async function ensureSeed() {
  if (!isBrowser()) return;
  // Repair anything corrupted before deciding whether seeding is needed.
  runIntegrityCheck();
  if (localStorage.getItem(KEYS.seeded)) return;

  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };
  const admin: User = {
    id: uid(),
    name: "System Admin",
    email: "admin@demo.local",
    passwordHash: await hashPassword("admin123"),
    role: "ADMIN",
    status: "active",
    createdDate: iso(daysAgo(30)),
  };
  const demoUser: User = {
    id: uid(),
    name: "Sara Patel",
    email: "sara@demo.local",
    passwordHash: await hashPassword("user123"),
    role: "USER",
    status: "active",
    age: 34,
    gender: "Female",
    phone: "+1 555-0100",
    bloodGroup: "O+",
    createdDate: iso(daysAgo(20)),
  };
  saveList(KEYS.users, [admin, demoUser]);

  // Seed metrics for demo user
  const metrics: HealthMetric[] = [];
  for (let i = 0; i < 14; i++) {
    metrics.push({
      id: uid(),
      userId: demoUser.id,
      type: "bp",
      systolic: 115 + Math.round(Math.sin(i) * 10 + Math.random() * 6),
      diastolic: 75 + Math.round(Math.cos(i) * 6 + Math.random() * 4),
      date: iso(daysAgo(13 - i)),
    });
    metrics.push({
      id: uid(),
      userId: demoUser.id,
      type: "sugar",
      value: 95 + Math.round(Math.sin(i * 0.8) * 12 + Math.random() * 8),
      unit: "mg/dL",
      date: iso(daysAgo(13 - i)),
    });
    metrics.push({
      id: uid(),
      userId: demoUser.id,
      type: "weight",
      value: 65 + Math.sin(i * 0.5) * 0.6,
      unit: "kg",
      date: iso(daysAgo(13 - i)),
    });
  }
  saveList(KEYS.metrics, metrics);

  saveList<Medication>(KEYS.medications, [
    {
      id: uid(),
      userId: demoUser.id,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      time: "08:00",
      reminder: true,
      startDate: iso(daysAgo(10)),
    },
    {
      id: uid(),
      userId: demoUser.id,
      name: "Vitamin D",
      dosage: "1000 IU",
      frequency: "Once daily",
      time: "09:00",
      reminder: true,
      startDate: iso(daysAgo(5)),
    },
  ]);

  saveList<Appointment>(KEYS.appointments, [
    {
      id: uid(),
      userId: demoUser.id,
      doctor: "Dr. Amelia Chen",
      specialty: "Cardiology",
      location: "City Heart Clinic",
      date: iso(new Date(now.getTime() + 3 * 86400000)).slice(0, 10),
      time: "10:30",
      status: "Approved",
    },
    {
      id: uid(),
      userId: demoUser.id,
      doctor: "Dr. Rajiv Kumar",
      specialty: "Endocrinology",
      location: "Wellness Center",
      date: iso(new Date(now.getTime() + 10 * 86400000)).slice(0, 10),
      time: "14:00",
      status: "Pending",
    },
  ]);

  const sleep: SleepLog[] = [];
  for (let i = 0; i < 7; i++) {
    sleep.push({
      id: uid(),
      userId: demoUser.id,
      hours: 6 + Math.random() * 2,
      quality: 3 + Math.round(Math.random() * 2),
      date: iso(daysAgo(6 - i)),
    });
  }
  saveList(KEYS.sleep, sleep);

  const fitness: FitnessLog[] = [];
  for (let i = 0; i < 7; i++) {
    fitness.push({
      id: uid(),
      userId: demoUser.id,
      activity: ["Walk", "Run", "Yoga", "Cycling"][i % 4],
      duration: 20 + Math.round(Math.random() * 40),
      calories: 120 + Math.round(Math.random() * 200),
      steps: 4000 + Math.round(Math.random() * 6000),
      date: iso(daysAgo(6 - i)),
    });
  }
  saveList(KEYS.fitness, fitness);

  saveList<EmergencyProfile>(KEYS.emergency, [
    {
      userId: demoUser.id,
      bloodGroup: "O+",
      allergies: "Penicillin",
      conditions: "Type 2 Diabetes",
      medications: "Metformin 500mg",
      contactName: "Rahul Patel",
      contactPhone: "+1 555-0199",
      contactRelation: "Spouse",
    },
  ]);

  saveList<Article>(KEYS.articles, [
    {
      id: uid(),
      title: "5 Habits for a Healthier Heart",
      category: "Cardiology",
      content:
        "Regular cardio, balanced nutrition, quality sleep, stress management, and routine check-ups form the foundation of heart health.",
      published: true,
      createdAt: iso(daysAgo(4)),
    },
    {
      id: uid(),
      title: "Managing Blood Sugar Naturally",
      category: "Diabetes",
      content:
        "Small, consistent lifestyle choices — mindful carbs, movement after meals, and hydration — help stabilize glucose over time.",
      published: true,
      createdAt: iso(daysAgo(2)),
    },
  ]);

  saveList<ActivityLog>(KEYS.activity, [
    {
      id: uid(),
      userId: demoUser.id,
      userName: demoUser.name,
      activity: "LOGIN",
      description: "Signed into account",
      timestamp: iso(daysAgo(1)),
      deviceType: "PC",
      browser: "Google Chrome",
      os: "Windows 10/11",
      ipAddress: "Local network",
      location: "1920×1080 · America/New_York",
    },
    {
      id: uid(),
      userId: demoUser.id,
      userName: demoUser.name,
      activity: "HEALTH_RECORD_ADDED",
      description: "Logged blood pressure",
      timestamp: iso(daysAgo(1)),
      deviceType: "Phone",
      browser: "Safari",
      os: "iOS",
      ipAddress: "Local network",
      location: "390×844 · America/New_York",
    },
    {
      id: uid(),
      userId: adminUser.id,
      userName: adminUser.name,
      activity: "LOGIN",
      description: "Signed into admin account",
      timestamp: iso(daysAgo(0)),
      deviceType: "PC",
      browser: "Google Chrome",
      os: "macOS",
      ipAddress: "Local network",
      location: "2560×1440 · America/New_York",
    },
  ]);

  Settings.save(defaultSettings);
  localStorage.setItem(KEYS.seeded, "1");
}
