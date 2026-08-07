import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Pill, Calendar, Activity, TrendingUp, Bell, Weight, Moon, Target, Sparkles, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Footprints } from "lucide-react";
import { StatsCard, PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLiveLoading, useLive } from "@/lib/useLive";
import { Metrics, Medications, Appointments, Notifications, Sleep, Goals } from "@/lib/storage";
import { computeHealthScore, generateInsights, getGoalProgress, type HealthInsight } from "@/lib/insights";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { DashboardSkeleton } from "@/components/page-skeleton";
import { AnimateIn } from "@/components/animate-in";

export const Route = createFileRoute("/_user/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — MediPulse" }, { name: "description", content: "Your health at a glance." }] }),
});

function Dashboard() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const { data: metrics, loading: l1 } = useLiveLoading(() => Metrics.forUser(uid), []);
  const { data: meds, loading: l2 } = useLiveLoading(() => Medications.forUser(uid), []);
  const { data: appts, loading: l3 } = useLiveLoading(() => Appointments.forUser(uid), []);
  const { data: notifs, loading: l4 } = useLiveLoading(() => Notifications.forUser(uid), []);
  const unread = useLiveLoading(() => Notifications.unreadCount(uid), 0).data;
  const { data: sleepData, loading: l5 } = useLiveLoading(() => Sleep.forUser(uid), []);
  const goals = useLive(() => Goals.forUser(uid), [] as unknown[]);
  const healthScore = useLive(() => computeHealthScore(uid), 0, [goals.length]);
  const insights = useLive(() => generateInsights(uid), [] as HealthInsight[], [goals.length]);
  const goalProgress = useLive(() => getGoalProgress(uid), [], [goals.length]);

  const loading = l1 || l2 || l3 || l4 || l5;

  if (loading) return <DashboardSkeleton />;

  const byDate = <T extends { date: string }>(list: T[]) =>
    list.slice().sort((a, b) => a.date.localeCompare(b.date));
  const bp = byDate(metrics.filter((m) => m.type === "bp"));
  const sugar = byDate(metrics.filter((m) => m.type === "sugar"));
  const weight = byDate(metrics.filter((m) => m.type === "weight"));
  const sleepLogs = byDate(sleepData);
  const upcoming = appts
    .filter((a) => a.status !== "Cancelled" && a.status !== "Completed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const latestBp = bp.at(-1);
  const latestSugar = sugar.at(-1);
  const latestWeight = weight.at(-1);
  const latestSleep = sleepLogs.at(-1);

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name?.split(" ")[0] ?? ""}`} description="Here's a snapshot of your wellness." />

      <div className="grid gap-4 lg:grid-cols-3 mb-2">
        <AnimateIn variant="fade-in-up" className="lg:col-span-1">
          <Card className="transition-shadow duration-200 hover:shadow-md h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Health score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(healthScore / 100) * 264} 264`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold tabular-nums">{healthScore}</span>
                  <span className="text-xs text-muted-foreground">out of 100</span>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground text-center">
                {healthScore >= 80 ? "Excellent progress today!" : healthScore >= 50 ? "Good — keep going!" : healthScore > 0 ? "Let's pick up the pace." : "Set goals to track your score."}
              </div>
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn variant="fade-in-up" delay={50} className="lg:col-span-2">
          <Card className="transition-shadow duration-200 hover:shadow-md h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Smart insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
                  <span className={`mt-0.5 ${ins.tone === "good" ? "text-success" : ins.tone === "warning" ? "text-warning" : "text-destructive"}`}>
                    {ins.icon === "CheckCircle2" ? <CheckCircle2 className="h-4 w-4" /> : ins.icon === "AlertTriangle" ? <AlertTriangle className="h-4 w-4" /> : ins.icon === "Moon" ? <Moon className="h-4 w-4" /> : ins.icon === "Footprints" ? <Footprints className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{ins.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ins.detail}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimateIn>
      </div>

      {goalProgress.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-2 stagger">
          {goalProgress.map((p) => (
            <Card key={p.goal.id} className="p-3 transition-shadow duration-200 hover:shadow-md">
              <div className="text-xs font-medium text-muted-foreground truncate">{p.label}</div>
              <div className="mt-1 text-lg font-semibold tabular-nums">{p.current.toLocaleString()}<span className="text-xs text-muted-foreground font-normal"> / {p.goal.target.toLocaleString()}</span></div>
              <Progress value={p.percent} className="h-1.5 mt-2" />
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 stagger">
        <StatsCard
          label="Blood pressure"
          value={latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : "—"}
          hint="Latest reading"
          icon={HeartPulse}
        />
        <StatsCard
          label="Blood sugar"
          value={latestSugar ? `${Math.round(latestSugar.value ?? 0)} ${latestSugar.unit ?? "mg/dL"}` : "—"}
          hint="Latest reading"
          icon={Activity}
          tone="success"
        />
        <StatsCard label="Medications" value={meds.length} hint="Active plans" icon={Pill} tone="warning" />
        <StatsCard label="Upcoming visits" value={upcoming.length} hint="Next 30 days" icon={Calendar} />
        <StatsCard
          label="Weight"
          value={latestWeight ? `${latestWeight.value} ${latestWeight.unit ?? "kg"}` : "—"}
          hint="Latest reading"
          icon={Weight}
          tone="success"
        />
        <StatsCard
          label="Sleep"
          value={latestSleep ? `${latestSleep.hours.toFixed(1)}h` : "—"}
          hint={latestSleep ? `Quality ${latestSleep.quality}/5` : "Last night"}
          icon={Moon}
          tone="primary"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimateIn variant="fade-in-up">
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Blood pressure trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bp.map((m) => ({ d: m.date.slice(5, 10), systolic: m.systolic, diastolic: m.diastolic }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="d" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="systolic" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="diastolic" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn variant="fade-in-up" delay={50}>
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Blood sugar trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sugar.map((m) => ({ d: m.date.slice(5, 10), v: m.value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="d" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Area type="monotone" dataKey="v" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn variant="fade-in-up" delay={100}>
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Weight className="h-4 w-4 text-primary" /> Weight trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weight.map((m) => ({ d: m.date.slice(5, 10), v: m.value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="d" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="v" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn variant="fade-in-up" delay={150}>
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" /> Sleep trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepLogs.map((s) => ({ d: s.date.slice(5, 10), hours: s.hours, quality: s.quality }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="d" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="hours" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimateIn>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimateIn variant="fade-in-up">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Upcoming appointments</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/appointments">Manage</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 && <div className="text-sm text-muted-foreground">Nothing scheduled.</div>}
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50">
                  <div>
                    <div className="font-medium">{a.doctor}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.specialty} · {a.date} at {a.time}
                    </div>
                  </div>
                  <Badge variant={a.status === "Approved" ? "default" : "secondary"}>{a.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn variant="fade-in-up" delay={50}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
                {unread > 0 && <Badge variant="default">{unread} new</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifs.length === 0 && <div className="text-sm text-muted-foreground">You're all caught up.</div>}
              {notifs.slice(0, 4).map((n) => (
                <div key={n.id} className={`rounded-lg border p-3 transition-colors hover:bg-accent/50 ${!n.read?.[uid] ? "border-primary/40 bg-primary/5" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{n.title}</div>
                    {!n.read?.[uid] && <button className="text-xs text-primary hover:underline" onClick={() => Notifications.markRead(n.id, uid)}>Mark read</button>}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                  <div className="mt-1 text-sm">{n.body}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimateIn>
      </div>
    </div>
  );
}
