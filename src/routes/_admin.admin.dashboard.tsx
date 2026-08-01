import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, HeartPulse, Calendar, Pill, FileText, Activity, TrendingUp, TrendingDown, Moon, Gauge, Weight, CircleCheck as CheckCircle2 } from "lucide-react";
import { StatsCard, PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLive } from "@/lib/useLive";
import {
  Users as UsersStore,
  Metrics,
  Appointments,
  Medications,
  Documents,
  Activity as ActivityStore,
} from "@/lib/storage";
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
  healthScoreTrend,
  averageHealthScore,
  activeUsersTrend,
} from "@/lib/analytics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AnimateIn } from "@/components/animate-in";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  component: Page,
  head: () => ({ meta: [{ title: "Admin Dashboard — MediPulse" }, { name: "description", content: "System-wide overview." }] }),
});

function Page() {
  const users = useLive(() => UsersStore.all(), []);
  const metrics = useLive(() => Metrics.all(), []);
  const appts = useLive(() => Appointments.all(), []);
  const meds = useLive(() => Medications.all(), []);
  const docs = useLive(() => Documents.all(), []);
  const acts = useLive(() => ActivityStore.all(), []);

  const patients = users.filter((u) => u.role === "USER");
  const active = patients.filter((u) => u.status === "active").length;

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
  const healthTrend = useLive(() => healthScoreTrend(), []);
  const avgScore = useLive(() => averageHealthScore(), 0);
  const auTrend = useLive(() => activeUsersTrend(), []);

  // Registrations per day (last 14)
  const days: { d: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ d: key.slice(5), count: patients.filter((u) => u.createdDate.slice(0, 10) === key).length });
  }

  // Activities per day
  const actDays: { d: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    actDays.push({ d: key.slice(5), count: acts.filter((a) => a.timestamp.slice(0, 10) === key).length });
  }

  const apptStatus = ["Pending", "Approved", "Completed", "Cancelled"].map((s) => ({
    name: s, value: appts.filter((a) => a.status === s).length,
  }));
  const COLORS = ["var(--chart-4)", "var(--chart-1)", "var(--chart-3)", "var(--chart-5)"];

  return (
    <div>
      <PageHeader title="System overview" description="Everything running at a glance.">
        <Button asChild variant="outline"><Link to="/admin/reports">View reports</Link></Button>
      </PageHeader>

      {/* Active users row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <StatsCard label="Daily active users" value={dau} hint="Logged in today" icon={Users} />
        <StatsCard label="Weekly active users" value={wau} hint="Last 7 days" icon={Users} tone="success" />
        <StatsCard label="Monthly active users" value={mau} hint="Last 30 days" icon={Users} tone="warning" />
        <StatsCard label="Avg health score" value={avgScore} hint="Across all patients" icon={Gauge} tone={avgScore >= 70 ? "success" : "warning"} />
      </div>

      {/* Health averages row */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
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
          icon={Activity}
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
          label="Medicine compliance"
          value={`${compliance.rate}%`}
          hint={`${compliance.withReminders}/${compliance.total} with reminders`}
          icon={Pill}
          tone={compliance.rate >= 70 ? "success" : "warning"}
        />
      </div>

      {/* Compliance + appointment success */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <StatsCard
          label="Appointment success"
          value={`${apptSuccess.rate}%`}
          hint={`${apptSuccess.successful}/${apptSuccess.total} approved or completed`}
          icon={CheckCircle2}
          tone={apptSuccess.rate >= 70 ? "success" : "destructive"}
        />
        <StatsCard label="Total users" value={patients.length} hint="Patients registered" icon={Users} />
        <StatsCard label="Health records" value={metrics.length} icon={HeartPulse} tone="warning" />
        <StatsCard label="Documents" value={docs.length} icon={FileText} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimateIn variant="fade-in-up">
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Active users trend (14 days)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <LineChart data={auTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Legend />
                  <Line type="monotone" dataKey="dau" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="Daily" />
                  <Line type="monotone" dataKey="wau" stroke="var(--chart-3)" strokeWidth={2} dot={false} name="Weekly" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn variant="fade-in-up" delay={50}>
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" /> Health score trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <AreaChart data={healthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Area type="monotone" dataKey="score" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} name="Avg score" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn variant="fade-in-up" delay={100}>
          <Card className="transition-shadow duration-200 hover:shadow-md">
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

        <AnimateIn variant="fade-in-up" delay={150}>
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Appointments by status
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={apptStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                    {apptStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimateIn>
      </div>

      {/* Compliance + appointment success bars */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimateIn variant="fade-in-up">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" /> Medicine compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reminders enabled</span>
                  <span className="font-medium">{compliance.rate}%</span>
                </div>
                <Progress value={compliance.rate} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-2">
                  <div className="text-lg font-semibold">{compliance.total}</div>
                  <div className="text-xs text-muted-foreground">Total meds</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-lg font-semibold text-success">{compliance.withReminders}</div>
                  <div className="text-xs text-muted-foreground">With reminders</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-lg font-semibold text-warning">{compliance.total - compliance.withReminders}</div>
                  <div className="text-xs text-muted-foreground">No reminders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn variant="fade-in-up" delay={50}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Appointment success rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Approved or completed</span>
                  <span className="font-medium">{apptSuccess.rate}%</span>
                </div>
                <Progress value={apptSuccess.rate} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-2">
                  <div className="text-lg font-semibold">{apptSuccess.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-lg font-semibold text-success">{apptSuccess.successful}</div>
                  <div className="text-xs text-muted-foreground">Successful</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-lg font-semibold text-destructive">{apptSuccess.total - apptSuccess.successful}</div>
                  <div className="text-xs text-muted-foreground">Pending/Cancelled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>
      </div>

      {/* Registrations + activity trend */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimateIn variant="fade-in-up">
          <Card>
            <CardHeader><CardTitle className="text-base">Registrations (14 days)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <BarChart data={days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="d" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimateIn>
        <AnimateIn variant="fade-in-up" delay={50}>
          <Card>
            <CardHeader><CardTitle className="text-base">Activity trend (7 days)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <LineChart data={actDays}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="d" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="count" stroke="var(--chart-3)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimateIn>
      </div>
    </div>
  );
}
