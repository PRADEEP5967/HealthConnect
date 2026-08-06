import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLive } from "@/lib/useLive";
import { Activity, Users, type ActivityLog } from "@/lib/storage";
import { AnimateIn } from "@/components/animate-in";
import {
  Smartphone, Monitor, Tablet, Trash2, Search, Download,
  Globe, Clock, User as UserIcon, Chrome, Apple,
} from "lucide-react";

export const Route = createFileRoute("/_admin/admin/activity-logs")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Activity logs — Admin" },
      { name: "description", content: "Audit user and system activity across all devices." },
    ],
  }),
});

const deviceIcon = (type?: string) => {
  switch (type) {
    case "Phone": return <Smartphone className="h-4 w-4" />;
    case "Tablet": return <Tablet className="h-4 w-4" />;
    case "PC": return <Monitor className="h-4 w-4" />;
    default: return <Monitor className="h-4 w-4" />;
  }
};

function Page() {
  const logs = useLive(() => Activity.all(), [] as ActivityLog[]);
  const users = useLive(() => Users.all(), []);
  const [q, setQ] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [selected, setSelected] = useState<ActivityLog | null>(null);

  const eventTypes = useMemo(() => {
    const set = new Set(logs.map((l) => l.activity));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs
      .filter((l) => {
        if (deviceFilter !== "all" && l.deviceType !== deviceFilter) return false;
        if (eventFilter !== "all" && l.activity !== eventFilter) return false;
        if (userFilter !== "all" && l.userId !== userFilter) return false;
        if (!q) return true;
        const s = q.toLowerCase();
        return (
          l.activity.toLowerCase().includes(s) ||
          l.description.toLowerCase().includes(s) ||
          (l.userName ?? "").toLowerCase().includes(s) ||
          (l.browser ?? "").toLowerCase().includes(s) ||
          (l.os ?? "").toLowerCase().includes(s) ||
          (l.location ?? "").toLowerCase().includes(s)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, q, deviceFilter, eventFilter, userFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const logins = logs.filter((l) => l.activity === "LOGIN").length;
    const uniqueUsers = new Set(logs.map((l) => l.userId)).size;
    const byDevice = { Phone: 0, Tablet: 0, PC: 0 };
    logs.forEach((l) => {
      if (l.deviceType && l.deviceType in byDevice) {
        (byDevice as Record<string, number>)[l.deviceType]++;
      }
    });
    return { total, logins, uniqueUsers, byDevice };
  }, [logs]);

  const exportCsv = () => {
    const headers = ["Timestamp", "User", "Event", "Description", "Device", "Browser", "OS", "IP", "Location"];
    const rows = filtered.map((l) => [
      new Date(l.timestamp).toISOString(),
      l.userName ?? l.userId.slice(0, 6),
      l.activity,
      l.description,
      l.deviceType ?? "",
      l.browser ?? "",
      l.os ?? "",
      l.ipAddress ?? "",
      l.location ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  return (
    <div>
      <PageHeader title="Activity logs" description="Every login, action, and event — across all devices and users.">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => { Activity.clear(); toast.success("Cleared"); }}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <StatsCard label="Total events" value={stats.total} icon={Clock} />
        <StatsCard label="Logins" value={stats.logins} icon={UserIcon} />
        <StatsCard label="Unique users" value={stats.uniqueUsers} icon={UserIcon} />
        <StatsCard label="Devices" value={stats.byDevice.Phone + stats.byDevice.Tablet + stats.byDevice.PC} icon={Smartphone} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Phone</span>
            <Badge variant="secondary" className="ml-auto">{stats.byDevice.Phone}</Badge>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <Tablet className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tablet</span>
            <Badge variant="secondary" className="ml-auto">{stats.byDevice.Tablet}</Badge>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">PC</span>
            <Badge variant="secondary" className="ml-auto">{stats.byDevice.PC}</Badge>
          </div>
        </Card>
      </div>

      <AnimateIn variant="fade-in-up">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search user, event, device..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
              </div>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All devices</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="PC">PC</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  {eventTypes.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table className="responsive-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((l) => (
                    <TableRow
                      key={l.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelected(l)}
                    >
                      <TableCell data-label="When" className="whitespace-nowrap text-sm">
                        {new Date(l.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell data-label="User" className="font-medium">
                        {l.userName ?? l.userId.slice(0, 6)}
                      </TableCell>
                      <TableCell data-label="Event">
                        <Badge variant="outline">{l.activity}</Badge>
                      </TableCell>
                      <TableCell data-label="Device">
                        <div className="flex items-center gap-1.5">
                          {deviceIcon(l.deviceType)}
                          <span className="text-sm">{l.deviceType ?? "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell data-label="Browser" className="text-sm text-muted-foreground">
                        {l.browser ?? "—"}
                      </TableCell>
                      <TableCell data-label="OS" className="text-sm text-muted-foreground">
                        {l.os ?? "—"}
                      </TableCell>
                      <TableCell data-label="Location" className="text-sm text-muted-foreground">
                        {l.location ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {logs.length} events
            </div>
          </CardContent>
        </Card>
      </AnimateIn>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selected.activity}</Badge>
                <span className="text-sm text-muted-foreground">{new Date(selected.timestamp).toLocaleString()}</span>
              </div>
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <Row icon={<UserIcon className="h-4 w-4" />} label="User" value={selected.userName ?? selected.userId.slice(0, 6)} />
                <Row icon={<Clock className="h-4 w-4" />} label="Description" value={selected.description} />
                <Row icon={deviceIcon(selected.deviceType)} label="Device type" value={selected.deviceType ?? "Unknown"} />
                <Row icon={<Chrome className="h-4 w-4" />} label="Browser" value={selected.browser ?? "Unknown"} />
                <Row icon={<Apple className="h-4 w-4" />} label="Operating system" value={selected.os ?? "Unknown"} />
                <Row icon={<Globe className="h-4 w-4" />} label="IP address" value={selected.ipAddress ?? "Unknown"} />
                <Row icon={<Globe className="h-4 w-4" />} label="Location / timezone" value={selected.location ?? "Unknown"} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-medium w-36">{label}</span>
      <span className="flex-1">{value}</span>
    </div>
  );
}
