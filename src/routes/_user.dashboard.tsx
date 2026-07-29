import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Pill, Calendar, Activity, TrendingUp, Bell } from "lucide-react";
import { StatsCard, PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLive } from "@/lib/useLive";
import { Metrics, Medications, Appointments, Notifications } from "@/lib/storage";import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/_user/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — MediPulse" }, { name: "description", content: "Your health at a glance." }] }),
});

function Dashboard() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const metrics = useLive(() => Metrics.forUser(uid), []);
  const meds = useLive(() => Medications.forUser(uid), []);
  const appts = useLive(() => Appointments.forUser(uid), []);
  const notifs = useLive(() => Notifications.forUser(uid), []);
  const unread = useLive(() => Notifications.unreadCount(uid), 0);

  const bp = metrics.filter((m) => m.type === "bp").slice().reverse();
  const sugar = metrics.filter((m) => m.type === "sugar").slice().reverse();
  const upcoming = appts
    .filter((a) => a.status !== "Cancelled" && a.status !== "Completed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const latestBp = bp.at(-1);
  const latestSugar = sugar.at(-1);

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name?.split(" ")[0] ?? ""}`} description="Here's a snapshot of your wellness." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
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

        <Card>
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
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
              <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
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
              <div key={n.id} className={`rounded-lg border p-3 ${!n.read?.[uid] ? "border-primary/40 bg-primary/5" : ""}`}>
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
      </div>
    </div>
  );
}
