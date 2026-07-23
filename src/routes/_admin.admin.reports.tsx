import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, HeartPulse, Calendar, Pill, FileText, Activity as ActivityIcon } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Users, Metrics, Appointments, Medications, Documents, Activity, exportBackup } from "@/lib/storage";

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

  const storageKb = Math.round(new Blob([JSON.stringify(exportBackup())]).size / 1024);

  const exportUsersCsv = () => {
    download("users.csv", toCsv(users.map(({ passwordHash: _p, ...rest }) => rest)), "text/csv");
    toast.success("Exported users.csv");
  };
  const exportActivityCsv = () => {
    download("activity.csv", toCsv(acts), "text/csv");
    toast.success("Exported activity.csv");
  };
  const exportSystemJson = () => {
    download("system-report.json", JSON.stringify({
      generatedAt: new Date().toISOString(),
      counts: { users: users.length, metrics: metrics.length, appointments: appts.length, medications: meds.length, documents: docs.length, activities: acts.length },
      storageKb,
    }, null, 2), "application/json");
    toast.success("Exported system-report.json");
  };

  return (
    <div>
      <PageHeader title="Reports & analytics" description="Snapshot the state of the platform." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Users" value={users.length} icon={UsersIcon} />
        <StatsCard label="Metrics" value={metrics.length} icon={HeartPulse} tone="success" />
        <StatsCard label="Appointments" value={appts.length} icon={Calendar} />
        <StatsCard label="Medications" value={meds.length} icon={Pill} tone="warning" />
        <StatsCard label="Documents" value={docs.length} icon={FileText} />
        <StatsCard label="Activities" value={acts.length} icon={ActivityIcon} />
        <StatsCard label="Storage used" value={`${storageKb} KB`} icon={FileText} />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Export</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={exportUsersCsv}>Users CSV</Button>
          <Button onClick={exportActivityCsv} variant="secondary">Activity CSV</Button>
          <Button onClick={exportSystemJson} variant="outline">System JSON</Button>
        </CardContent>
      </Card>
    </div>
  );
}
