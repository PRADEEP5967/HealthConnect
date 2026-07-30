import {
  Users as UsersStore,
  Metrics,
  Appointments,
  Medications,
  Sleep,
  Fitness,
  Activity as ActivityStore,
  type User,
  type HealthMetric,
  type Appointment,
  type Medication,
  type SleepLog,
} from "@/lib/storage";

const DAY = 86400000;
const todayKey = () => new Date().toISOString().slice(0, 10);
const daysAgoKey = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

// ===== Active Users =====

export function dailyActiveUsers(): number {
  const today = todayKey();
  return ActivityStore.all().filter((a) => a.timestamp.slice(0, 10) === today && a.activity === "LOGIN").length;
}

export function weeklyActiveUsers(): number {
  const weekAgo = daysAgoKey(7);
  const seen = new Set<string>();
  ActivityStore.all().forEach((a) => {
    if (a.timestamp.slice(0, 10) >= weekAgo && a.activity === "LOGIN") seen.add(a.userId);
  });
  return seen.size;
}

export function monthlyActiveUsers(): number {
  const monthAgo = daysAgoKey(30);
  const seen = new Set<string>();
  ActivityStore.all().forEach((a) => {
    if (a.timestamp.slice(0, 10) >= monthAgo && a.activity === "LOGIN") seen.add(a.userId);
  });
  return seen.size;
}

// ===== Medicine Compliance =====
// Ratio of medications with reminders enabled (proxy for adherence tracking).
export function medicineCompliance(): { rate: number; total: number; withReminders: number } {
  const meds = Medications.all();
  const total = meds.length;
  const withReminders = meds.filter((m) => m.reminder).length;
  const rate = total > 0 ? Math.round((withReminders / total) * 100) : 0;
  return { rate, total, withReminders };
}

// ===== Appointment Success =====
// Percentage of appointments that were Completed or Approved (not Cancelled/Pending).
export function appointmentSuccess(): { rate: number; total: number; successful: number } {
  const appts = Appointments.all();
  const total = appts.length;
  const successful = appts.filter((a) => a.status === "Completed" || a.status === "Approved").length;
  const rate = total > 0 ? Math.round((successful / total) * 100) : 0;
  return { rate, total, successful };
}

// ===== Average Sleep =====
export function averageSleep(): { hours: number; quality: number; count: number } {
  const logs = Sleep.all();
  const count = logs.length;
  const hours = count > 0 ? Math.round((logs.reduce((s, l) => s + l.hours, 0) / count) * 10) / 10 : 0;
  const quality = count > 0 ? Math.round((logs.reduce((s, l) => s + l.quality, 0) / count) * 10) / 10 : 0;
  return { hours, quality, count };
}

// ===== Average BP =====
export function averageBP(): { systolic: number; diastolic: number; count: number } {
  const bp = Metrics.all().filter((m) => m.type === "bp");
  const count = bp.length;
  const systolic = count > 0 ? Math.round(bp.reduce((s, m) => s + (m.systolic ?? 0), 0) / count) : 0;
  const diastolic = count > 0 ? Math.round(bp.reduce((s, m) => s + (m.diastolic ?? 0), 0) / count) : 0;
  return { systolic, diastolic, count };
}

// ===== Average Sugar =====
export function averageSugar(): { value: number; count: number } {
  const sugar = Metrics.all().filter((m) => m.type === "sugar");
  const count = sugar.length;
  const value = count > 0 ? Math.round(sugar.reduce((s, m) => s + (m.value ?? 0), 0) / count) : 0;
  return { value, count };
}

// ===== Weight Progress =====
// Trend of average weight per user over the last 14 days.
export function weightProgress(): { date: string; avgWeight: number }[] {
  const all = Metrics.all().filter((m) => m.type === "weight");
  const result: { date: string; avgWeight: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = daysAgoKey(i);
    const dayVals = all.filter((m) => m.date.slice(0, 10) === key);
    const avg = dayVals.length > 0 ? Math.round((dayVals.reduce((s, m) => s + (m.value ?? 0), 0) / dayVals.length) * 10) / 10 : 0;
    if (avg > 0) result.push({ date: key.slice(5), avgWeight: avg });
  }
  return result;
}

// ===== Health Score Trend =====
// Composite score (0-100) computed from BP, sugar, sleep, and activity.
// Lower BP and sugar = higher score; more sleep and activity = higher score.
export function healthScoreForUser(userId: string): number {
  const userMetrics = Metrics.forUser(userId);
  const sleepLogs = Sleep.forUser(userId);
  const fitnessLogs = Fitness.forUser(userId);

  let score = 100;

  // BP penalty: ideal is ~120/80
  const bp = userMetrics.filter((m) => m.type === "bp").at(-1);
  if (bp) {
    const sysDiff = Math.abs((bp.systolic ?? 120) - 120);
    const diaDiff = Math.abs((bp.diastolic ?? 80) - 80);
    score -= Math.min(30, (sysDiff + diaDiff) * 0.3);
  }

  // Sugar penalty: ideal is ~90 mg/dL
  const sugar = userMetrics.filter((m) => m.type === "sugar").at(-1);
  if (sugar && sugar.value) {
    const diff = Math.abs(sugar.value - 90);
    score -= Math.min(25, diff * 0.2);
  }

  // Sleep bonus: ideal 7-9 hours
  const sleep = sleepLogs.at(-1);
  if (sleep) {
    if (sleep.hours < 6) score -= 10;
    else if (sleep.hours > 9) score -= 5;
    else score += 5;
  } else {
    score -= 5;
  }

  // Activity bonus
  const recentFitness = fitnessLogs.filter((f) => {
    const diff = (Date.now() - new Date(f.date).getTime()) / DAY;
    return diff <= 7;
  });
  if (recentFitness.length >= 3) score += 10;
  else if (recentFitness.length >= 1) score += 5;
  else score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function healthScoreTrend(): { date: string; score: number }[] {
  // Compute average health score across all patients for each of last 14 days
  const patients = UsersStore.all().filter((u) => u.role === "USER");
  const result: { date: string; score: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = daysAgoKey(i);
    // Approximate: use current scores weighted by activity on that day
    if (patients.length === 0) continue;
    const dayActs = ActivityStore.all().filter((a) => a.timestamp.slice(0, 10) === key);
    if (dayActs.length === 0) {
      result.push({ date: key.slice(5), score: 0 });
      continue;
    }
    const activeUserIds = new Set(dayActs.map((a) => a.userId));
    const scores = [...activeUserIds].map((id) => healthScoreForUser(id));
    const avg = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    result.push({ date: key.slice(5), score: avg });
  }
  return result;
}

export function averageHealthScore(): number {
  const patients = UsersStore.all().filter((u) => u.role === "USER");
  if (patients.length === 0) return 0;
  const scores = patients.map((p) => healthScoreForUser(p.id));
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}

// ===== Active users trend (last 14 days) =====
export function activeUsersTrend(): { date: string; dau: number; wau: number }[] {
  const result: { date: string; dau: number; wau: number }[] = [];
  const acts = ActivityStore.all().filter((a) => a.activity === "LOGIN");
  for (let i = 13; i >= 0; i--) {
    const key = daysAgoKey(i);
    const dau = acts.filter((a) => a.timestamp.slice(0, 10) === key).length;
    const weekStart = daysAgoKey(i + 7);
    const wauSet = new Set<string>();
    acts.forEach((a) => {
      if (a.timestamp.slice(0, 10) >= weekStart && a.timestamp.slice(0, 10) <= key) wauSet.add(a.userId);
    });
    result.push({ date: key.slice(5), dau, wau: wauSet.size });
  }
  return result;
}
