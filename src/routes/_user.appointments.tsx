import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLiveLoading } from "@/lib/useLive";
import { AnimateIn } from "@/components/animate-in";
import { TableSkeleton } from "@/components/page-skeleton";
import { Appointments, Activity, uid, type Appointment } from "@/lib/storage";

export const Route = createFileRoute("/_user/appointments")({
  component: Page,
  head: () => ({ meta: [{ title: "Appointments — MediPulse" }, { name: "description", content: "Manage your medical appointments." }] }),
});

function Page() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data: items, loading } = useLiveLoading(() => Appointments.forUser(userId), []);
  const [f, setF] = useState({ doctor: "", specialty: "", location: "", date: "", time: "10:00", notes: "" });

  const add = () => {
    if (!f.doctor || !f.date) return toast.error("Doctor and date required");
    Appointments.add({ id: uid(), userId, status: "Pending", ...f });
    Activity.log(userId, "APPOINTMENT_CREATED", `Booked ${f.doctor} on ${f.date}`);
    setF({ doctor: "", specialty: "", location: "", date: "", time: "10:00", notes: "" });
    toast.success("Appointment created");
  };

  const badge = (s: Appointment["status"]) =>
    s === "Approved" ? "default" : s === "Completed" ? "secondary" : s === "Cancelled" ? "destructive" : "outline";

  return (
    <div>
      <PageHeader title="Appointments" description="Book and manage your visits." />
      <div className="grid gap-4 lg:grid-cols-3">
        <AnimateIn variant="fade-in-up">
        <Card>
          <CardHeader><CardTitle className="text-base">New appointment</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Doctor</Label><Input value={f.doctor} onChange={(e) => setF({ ...f, doctor: e.target.value })} /></div>
            <div><Label>Specialty</Label><Input value={f.specialty} onChange={(e) => setF({ ...f, specialty: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
              <div><Label>Time</Label><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
            </div>
            <Button className="w-full" onClick={add}>Book appointment</Button>
          </CardContent>
        </Card>
        </AnimateIn>

        <div className="lg:col-span-2 space-y-3 stagger">
          {loading && <TableSkeleton rows={4} />}
          {!loading && items.length === 0 && <div className="text-sm text-muted-foreground">No appointments yet.</div>}
          {!loading && items.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{a.doctor}</div>
                  <div className="text-xs text-muted-foreground">{a.specialty} · {a.location}</div>
                  <div className="text-xs mt-1">{a.date} at {a.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={a.status} onValueChange={(v) => { Appointments.update(a.id, { status: v as Appointment["status"] }); toast.success(`Status updated to ${v}`); }}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Pending", "Approved", "Completed", "Cancelled"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant={badge(a.status)}>{a.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => { Appointments.remove(a.id); toast.success("Appointment deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
