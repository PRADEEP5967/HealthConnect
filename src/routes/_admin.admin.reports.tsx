import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users as UsersIcon, HeartPulse, Calendar, Pill, FileText, Activity as ActivityIcon, Moon, Gauge, Weight, CircleCheck as CheckCircle2, TrendingUp } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Users, Metrics, Appointments, Medications, Documents, Activity, exportBackup } from "@/lib/storage";
import {
  dailyActiveUsers,
  weeklyActiveUsers,
  monthlyActiveUsers,
  medicineCompliance,
  appointmentSuccess,
  averageSleep,
  averageBP,
  averageSugar,
  weightProgress,
  averageHealthScore,
} from "@/lib/analytics";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { AnimateIn } from "@/components/animate-in";

export const Route = createFileRoute("/_admin/admin/reports")({
  component: Page,
  head: () => ({ meta: [{ title: "Reports — Admin" }, { name: "description", content: "Generate and export system reports." }] }),
});

function download(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  return [cols.join(","), ...rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(","))].join("\n");
}

function Page() {
  const users = useLive(() => Users.all(), []);
  const metrics = useLive(() => Metrics.all(), []);
  const appts = useLive(() => Appointments.all(), []);
  const meds = useLive(() => Medications.all(), []);
  const docs = useLive(() => Documents.all(), []);
  const acts = useLive(() => Activity.all(), []);

  // Analytics
  const dau = useLive(() => dailyActiveUsers(), 0);
  const wau = useLive(() => weeklyActiveUsers(), 0);
  const mau = useLive(() => monthlyActiveUsers(), 0);
  const compliance = useLive(() => medicineCompliance(), { rate: 0, total: 0, withReminders: 0 });
  const apptSuccess = useLive(() => appointmentSuccess(), { rate: 0, total: 0, successful: 0 });
  const avgSleep = useLive(() => averageSleep(), { hours: 0, quality: 0, count: 0 });
  const avgBP = useLive(() => averageBP(), { systolic: 0, diastolic: 0, count: 0 });
  const avgSugar = useLive(() => averageSugar(), { value: 0, count: 0 });
  const weightTrend = useLive(() => weightProgress(), []);
  const avgScore = useLive(() => averageHealthScore(), 0);

  const storageKb = Math.round(new Blob([JSON.stringify(exportBackup())]).size / 1024);

  const exportUsersCsv = () => {
    download("users.csv", toCsv(users.map(({ passwordHash: _p, ...rest }) => rest)), "text/csv");
    toast.success("Exported users.csv");
  };
  const exportActivityCsv = () => {
    download("activity.csv", toCsv(acts as unknown as Record<string, unknown>[]), "text/csv");
    toast.success("Exported activity.csv");
  };
  const exportAnalyticsJson = () => {
    download("analytics-report.json", JSON.stringify({
      generatedAt: new Date().toISOString(),
      activeUsers: { daily: dau, weekly: wau, monthly: mau },
      healthAverages: {
        bloodPressure: avgBP,
        bloodSugar: avgSugar,
        sleep: avgSleep,
        healthScore: avgScore,
      },
      medicineCompliance: compliance,
      appointmentSuccess: apptSuccess,
      counts: { users: users.length, metrics: metrics.length, appointments: appts.length, medications: meds.length, documents: docs.length, activities: acts.length },
      storageKb,
    }, null, 2), "application/json");
    toast.success("Exported analytics-report.json");
  };

  return (
    <div>
      <PageHeader title="Reports & analytics" description="Full snapshot of platform health and engagement." />

      {/* Active users */}
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Active users</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
        <StatsCard label="Daily active users" value={dau} hint="Today" icon={UsersIcon} />
        <StatsCard label="Weekly active users" value={wau} hint="Last 7 days" icon={UsersIcon} tone="success" />
        <StatsCard label="Monthly active users" value={mau} hint="Last 30 days" icon={UsersIcon} tone="warning" />
      </div>

      {/* Health averages */}
      <h3 className="mb-2 mt-6 text-sm font-medium text-muted-foreground">Health averages</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <StatsCard
          label="Average BP"
          value={avgBP.count > 0 ? `${avgBP.systolic}/${avgBP.diastolic}` : "—"}
          hint={`${avgBP.count} readings`}
          icon={HeartPulse}
        />
        <StatsCard
          label="Average sugar"
          value={avgSugar.count > 0 ? `${avgSugar.value} mg/dL` : "—"}
          hint={`${avgSugar.count} readings`}
          icon={ActivityIcon}
          tone="success"
        />
        <StatsCard
          label="Average sleep"
          value={avgSleep.count > 0 ? `${avgSleep.hours}h` : "—"}
          hint={avgSleep.count > 0 ? `Quality ${avgSleep.quality}/5` : "No data"}
          icon={Moon}
          tone="primary"
        />
        <StatsCard
          label="Avg health score"
          value={avgScore}
          hint="0–100 composite"
          icon={Gauge}
          tone={avgScore >= 70 ? "success" : "warning"}
        />
      </div>

      {/* Compliance + appointment success */}
      <h3 className="mb-2 mt-6 text-sm font-medium text-muted-foreground">Engagement</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <StatsCard
          label="Medicine compliance"
          value={`${compliance.rate}%`}
          hint={`${compliance.withReminders}/${compliance.total} with reminders`}
          icon={Pill}
          tone={compliance.rate >= 70 ? "success" : "warning"}
        />
        <StatsCard
          label="Appointment success"
          value={`${apptSuccess.rate}%`}
          hint={`${apptSuccess.successful}/${apptSuccess.total} successful`}
          icon={CheckCircle2}
          tone={apptSuccess.rate >= 70 ? "success" : "destructive"}
        />
        <StatsCard label="Total users" value={users.length} icon={UsersIcon} />
        <StatsCard label="Total metrics" value={metrics.length} icon={HeartPulse} tone="warning" />
      </div>

      {/* Weight progress chart */}
      <AnimateIn variant="fade-in-up" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Weight className="h-4 w-4 text-primary" /> Weight progress (14 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <LineChart data={weightTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Line type="monotone" dataKey="avgWeight" stroke="var(--chart-4)" strokeWidth={2} dot={false} name="Avg weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </AnimateIn>

      {/* Compliance + appointment progress bars */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimateIn variant="fade-in-up">
          <Card>
            <CardHeader><CardTitle className="text-base">Medicine compliance breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reminders enabled rate</span>
                  <span className="font-medium">{compliance.rate}%</span>
                </div>
                <Progress value={compliance.rate} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-2"><div className="text-lg font-semibold">{compliance.total}</div><div className="text-xs text-muted-foreground">Total</div></div>
                <div className="rounded-lg border p-2"><div className="text-lg font-semibold text-success">{compliance.withReminders}</div><div className="text-xs text-muted-foreground">With reminders</div></div>
                <div className="rounded-lg border p-2"><div className="text-lg font-semibold text-warning">{compliance.total - compliance.withReminders}</div><div className="text-xs text-muted-foreground">No reminders</div></div>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>
        <AnimateIn variant="fade-in-up" delay={50}>
          <Card>
            <CardHeader><CardTitle className="text-base">Appointment success breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Success rate</span>
                  <span className="font-medium">{apptSuccess.rate}%</span>
                </div>
                <Progress value={apptSuccess.rate} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-2"><div className="text-lg font-semibold">{apptSuccess.total}</div><div className="text-xs text-muted-foreground">Total</div></div>
                <div className="rounded-lg border p-2"><div className="text-lg font-semibold text-success">{apptSuccess.successful}</div><div className="text-xs text-muted-foreground">Successful</div></div>
                <div className="rounded-lg border p-2"><div className="text-lg font-semibold text-destructive">{apptSuccess.total - apptSuccess.successful}</div><div className="text-xs text-muted-foreground">Pending/Cancelled</div></div>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>
      </div>

      {/* Data counts */}
      <h3 className="mb-2 mt-6 text-sm font-medium text-muted-foreground">Data counts</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <StatsCard label="Appointments" value={appts.length} icon={Calendar} />
        <StatsCard label="Medications" value={meds.length} icon={Pill} tone="warning" />
        <StatsCard label="Documents" value={docs.length} icon={FileText} />
        <StatsCard label="Activities" value={acts.length} icon={ActivityIcon} />
        <StatsCard label="Storage used" value={`${storageKb} KB`} icon={FileText} />
      </div>

      {/* Export */}
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Export</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={exportUsersCsv}>Users CSV</Button>
          <Button onClick={exportActivityCsv} variant="secondary">Activity CSV</Button>
          <Button onClick={exportAnalyticsJson} variant="outline">Analytics JSON</Button>
        </CardContent>
      </Card>
    </div>
  );
}
