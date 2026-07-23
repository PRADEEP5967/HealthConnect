import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLive } from "@/lib/useLive";
import { Activity } from "@/lib/storage";

export const Route = createFileRoute("/_admin/admin/activity-logs")({
  component: Page,
  head: () => ({ meta: [{ title: "Activity logs — Admin" }, { name: "description", content: "Audit user and system activity." }] }),
});

function Page() {
  const logs = useLive(() => Activity.all(), []);
  const [q, setQ] = useState("");
  const filtered = logs.filter((l) =>
    !q || l.activity.toLowerCase().includes(q.toLowerCase()) ||
    l.description.toLowerCase().includes(q.toLowerCase()) ||
    (l.userName ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Activity logs" description="Every meaningful event, timestamped.">
        <Button variant="outline" onClick={() => { Activity.clear(); toast.success("Cleared"); }}>Clear logs</Button>
      </PageHeader>
      <Card>
        <CardContent className="p-4">
          <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs mb-3" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>When</TableHead><TableHead>User</TableHead><TableHead>Event</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{l.userName ?? l.userId.slice(0, 6)}</TableCell>
                    <TableCell><Badge variant="outline">{l.activity}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{l.description}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No logs</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
