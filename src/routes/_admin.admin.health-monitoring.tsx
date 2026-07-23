import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLive } from "@/lib/useLive";
import { Users, Metrics, Records, uid } from "@/lib/storage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_admin/admin/health-monitoring")({
  component: Page,
  head: () => ({ meta: [{ title: "Health monitoring — Admin" }, { name: "description", content: "Monitor patient health activity." }] }),
});

function Page() {
  const users = useLive(() => Users.all().filter((u) => u.role === "USER"), []);
  const [uidSel, setUidSel] = useState<string>("");
  const [note, setNote] = useState("");
  const metrics = useLive(() => (uidSel ? Metrics.forUser(uidSel) : []), []);
  const records = useLive(() => (uidSel ? Records.forUser(uidSel) : []), []);

  // These useLive hooks don't re-run on uid change since they don't take deps.
  // Simpler: recompute live at render:
  const liveMetrics = uidSel ? Metrics.forUser(uidSel) : metrics;
  const liveRecords = uidSel ? Records.forUser(uidSel) : records;

  const addNote = () => {
    if (!uidSel || !note) return;
    Records.add({ id: uid(), userId: uidSel, title: "Admin note", category: "Note", notes: note, adminNotes: note, date: new Date().toISOString() });
    setNote("");
    toast.success("Note added to patient timeline");
  };

  return (
    <div>
      <PageHeader title="Patient health monitoring" description="Review any patient's health activity." />
      <Card className="mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="min-w-56">
            <div className="mb-1 text-sm text-muted-foreground">Select patient</div>
            <Select value={uidSel} onValueChange={setUidSel}>
              <SelectTrigger className="min-w-56"><SelectValue placeholder="Choose a patient" /></SelectTrigger>
              <SelectContent>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} · {u.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {uidSel && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Health metrics</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {liveMetrics.slice(0, 30).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{m.type}</TableCell>
                      <TableCell>{m.type === "bp" ? `${m.systolic}/${m.diastolic}` : `${Math.round((m.value ?? 0) * 10) / 10} ${m.unit ?? ""}`}</TableCell>
                    </TableRow>
                  ))}
                  {liveMetrics.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No metrics</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Add admin note</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Recommendation or observation..." />
              <Button className="w-full" onClick={addNote}>Add to timeline</Button>
              <div className="mt-3 space-y-2">
                {liveRecords.filter((r) => r.category === "Note").slice(0, 5).map((r) => (
                  <div key={r.id} className="rounded-md border p-2 text-sm">
                    <div className="text-xs text-muted-foreground">{new Date(r.date).toLocaleString()}</div>
                    {r.notes}
                  </div>
                ))}
              </div>
              <Badge variant="secondary">Local export coming soon</Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
