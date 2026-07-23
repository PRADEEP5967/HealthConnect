import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, HeartPulse, Calendar, Pill, FileText, Activity, TrendingUp } from "lucide-react";
import { StatsCard, PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLive } from "@/lib/useLive";
import {
  Users as UsersStore,
  Metrics,
  Appointments,
  Medications,
  Documents,
  Activity as ActivityStore,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total users" value={patients.length} hint="Patients registered" icon={Users} />
        <StatsCard label="Active users" value={active} icon={Users} tone="success" />
        <StatsCard label="Health records" value={metrics.length} icon={HeartPulse} tone="warning" />
        <StatsCard label="Appointments" value={appts.length} icon={Calendar} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Medications" value={meds.length} icon={Pill} />
        <StatsCard label="Documents" value={docs.length} icon={FileText} />
        <StatsCard label="Activities today" value={acts.filter((a) => a.timestamp.slice(0, 10) === new Date().toISOString().slice(0, 10)).length} icon={Activity} tone="success" />
        <StatsCard label="Total activities" value={acts.length} icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
        <Card>
          <CardHeader><CardTitle className="text-base">Activity trend</CardTitle></CardHeader>
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
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Appointments by status</CardTitle></CardHeader>
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
      </div>
    </div>
  );
}
