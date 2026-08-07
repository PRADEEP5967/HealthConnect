import { Fitness, Nutrition, Sleep, Goals, Metrics, type HealthGoal } from "./storage";

export interface GoalProgress {
  goal: HealthGoal;
  current: number;
  percent: number;
  label: string;
  unit: string;
}

export interface HealthInsight {
  icon: string;
  title: string;
  detail: string;
  tone: "good" | "warning" | "bad";
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getGoalProgress(userId: string): GoalProgress[] {
  const goals = Goals.forUser(userId);
  const today = todayStr();
  const fitness = Fitness.forUser(userId).filter((f) => f.date === today);
  const nutrition = Nutrition.forUser(userId).filter((n) => n.date === today);
  const sleep = Sleep.forUser(userId).filter((s) => s.date === today);
  const metrics = Metrics.forUser(userId).filter((m) => m.date === today);

  return goals.map((goal) => {
    let current = 0;
    switch (goal.type) {
      case "steps":
        current = fitness.reduce((sum, f) => sum + (f.steps ?? 0), 0);
        break;
      case "exercise":
        current = fitness.reduce((sum, f) => sum + f.duration, 0);
        break;
      case "calories":
        current = nutrition.reduce((sum, n) => sum + n.calories, 0);
        break;
      case "sleep":
        current = sleep.reduce((sum, s) => sum + s.hours, 0);
        break;
      case "water":
        current = metrics.filter((m) => m.type === "water").reduce((sum, m) => sum + (m.value ?? 0), 0);
        break;
    }
    const percent = goal.target > 0 ? Math.min(100, Math.round((current / goal.target) * 100)) : 0;
    return { goal, current, percent, label: goalLabel(goal.type), unit: goal.unit };
  });
}

export function goalLabel(type: HealthGoal["type"]): string {
  return { steps: "Daily steps", sleep: "Sleep hours", water: "Water intake", exercise: "Exercise minutes", calories: "Calories consumed" }[type];
}

export function computeHealthScore(userId: string): number {
  const progress = getGoalProgress(userId);
  if (progress.length === 0) return 0;
  const avg = progress.reduce((sum, p) => sum + p.percent, 0) / progress.length;
  return Math.round(avg);
}

export function generateInsights(userId: string): HealthInsight[] {
  const insights: HealthInsight[] = [];
  const progress = getGoalProgress(userId);
  const sleepLogs = Sleep.forUser(userId).slice(-7);
  const fitness = Fitness.forUser(userId).filter((f) => f.date >= recentDate(7));

  for (const p of progress) {
    if (p.percent >= 100) {
      insights.push({
        icon: "CheckCircle2",
        title: `${p.label} goal achieved!`,
        detail: `You've reached ${p.current}${p.unit} of your ${p.goal.target}${p.unit} target today.`,
        tone: "good",
      });
    } else if (p.percent < 30) {
      insights.push({
        icon: "AlertTriangle",
        title: `${p.label} needs attention`,
        detail: `You're at ${p.percent}% of your daily ${p.label.toLowerCase()} goal.`,
        tone: "bad",
      });
    }
  }

  if (sleepLogs.length >= 3) {
    const avgSleep = sleepLogs.reduce((sum, s) => sum + s.hours, 0) / sleepLogs.length;
    if (avgSleep < 6) {
      insights.push({
        icon: "Moon",
        title: "Sleep deficit detected",
        detail: `Your average sleep is ${avgSleep.toFixed(1)}h over the last week. Aim for 7-9 hours.`,
        tone: "warning",
      });
    } else if (avgSleep >= 7) {
      insights.push({
        icon: "Moon",
        title: "Healthy sleep pattern",
        detail: `Averaging ${avgSleep.toFixed(1)}h of sleep — great consistency!`,
        tone: "good",
      });
    }
  }

  if (fitness.length >= 4) {
    const totalSteps = fitness.reduce((sum, f) => sum + (f.steps ?? 0), 0);
    insights.push({
      icon: "Footprints",
      title: "Active week",
      detail: `You logged ${fitness.length} workouts and ${totalSteps.toLocaleString()} steps in the last 7 days.`,
      tone: "good",
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: "Sparkles",
      title: "Start tracking today",
      detail: "Set health goals and log activities to get personalized insights.",
      tone: "good",
    });
  }

  return insights.slice(0, 5);
}

function recentDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
