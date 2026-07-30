import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pill } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLiveLoading } from "@/lib/useLive";
import { Medications, Activity, uid } from "@/lib/storage";
import { AnimateIn } from "@/components/animate-in";
import { TableSkeleton } from "@/components/page-skeleton";

export const Route = createFileRoute("/_user/medicine")({
  component: MedicinePage,
  head: () => ({ meta: [{ title: "Medications — MediPulse" }, { name: "description", content: "Manage your medications and reminders." }] }),
});

function MedicinePage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data: meds, loading } = useLiveLoading(() => Medications.forUser(userId), []);
  const [f, setF] = useState({ name: "", dosage: "", frequency: "Once daily", time: "08:00", reminder: true });

  const add = () => {
    if (!f.name || !f.dosage) return toast.error("Name and dosage required");
    Medications.add({
      id: uid(),
      userId,
      name: f.name,
      dosage: f.dosage,
      frequency: f.frequency,
      time: f.time,
      reminder: f.reminder,
      startDate: new Date().toISOString(),
    });
    Activity.log(userId, "MEDICINE_CREATED", `Added ${f.name}`);
    setF({ name: "", dosage: "", frequency: "Once daily", time: "08:00", reminder: true });
    toast.success("Medication added");
  };

  return (
    <div>
      <PageHeader title="Medications" description="Track prescriptions and set reminders." />
      <div className="grid gap-4 lg:grid-cols-3">
        <AnimateIn variant="fade-in-up">
        <Card>
          <CardHeader><CardTitle className="text-base">New medication</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div><Label>Dosage</Label><Input placeholder="e.g. 500mg" value={f.dosage} onChange={(e) => setF({ ...f, dosage: e.target.value })} /></div>
            <div><Label>Frequency</Label><Input value={f.frequency} onChange={(e) => setF({ ...f, frequency: e.target.value })} /></div>
            <div><Label>Time</Label><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rem">Reminder</Label>
              <Switch id="rem" checked={f.reminder} onCheckedChange={(v) => setF({ ...f, reminder: v })} />
            </div>
            <Button className="w-full" onClick={add}>Add medication</Button>
          </CardContent>
        </Card>
        </AnimateIn>

        <div className="lg:col-span-2 space-y-3 stagger">
          {loading && <TableSkeleton rows={4} />}
          {!loading && meds.length === 0 && <div className="text-sm text-muted-foreground">No medications yet.</div>}
          {meds.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Pill className="h-5 w-5" /></div>
                  <div>
                    <div className="font-medium">{m.name} <span className="text-muted-foreground font-normal">· {m.dosage}</span></div>
                    <div className="text-xs text-muted-foreground">{m.frequency} at {m.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.reminder && <Badge variant="secondary">Reminder</Badge>}
                  <Button variant="ghost" size="icon" onClick={() => { Medications.remove(m.id); toast.success("Medication removed"); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
