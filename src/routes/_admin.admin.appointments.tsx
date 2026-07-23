import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Appointments, Users, type Appointment } from "@/lib/storage";

export const Route = createFileRoute("/_admin/admin/appointments")({
  component: Page,
  head: () => ({ meta: [{ title: "Appointments — Admin" }, { name: "description", content: "Manage all appointments." }] }),
});

function Page() {
  const items = useLive(() => Appointments.all(), []);
  const users = useLive(() => Users.all(), []);
  const nameFor = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown";

  const badge = (s: Appointment["status"]) =>
    s === "Approved" ? "default" : s === "Completed" ? "secondary" : s === "Cancelled" ? "destructive" : "outline";

  return (
    <div>
      <PageHeader title="Appointments" description="Approve, cancel, or complete visits." />
      <Card>
        <CardContent className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead><TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead><TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{nameFor(a.userId)}</TableCell>
                  <TableCell>{a.doctor} <span className="text-muted-foreground">· {a.specialty}</span></TableCell>
                  <TableCell>{a.date} {a.time}</TableCell>
                  <TableCell><Badge variant={badge(a.status)}>{a.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Select value={a.status} onValueChange={(v) => Appointments.update(a.id, { status: v as Appointment["status"] })}>
                      <SelectTrigger className="w-32 inline-flex"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Pending", "Approved", "Completed", "Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => { Appointments.remove(a.id); toast.success("Removed"); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No appointments</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
