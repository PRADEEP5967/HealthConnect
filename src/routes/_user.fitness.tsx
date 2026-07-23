import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLive } from "@/lib/useLive";
import { Fitness, uid } from "@/lib/storage";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_user/fitness")({
  component: Page,
  head: () => ({ meta: [{ title: "Fitness — MediPulse" }, { name: "description", content: "Log workouts and steps." }] }),
});

function Page() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const logs = useLive(() => Fitness.forUser(userId), []);
  const [f, setF] = useState({ activity: "Walk", duration: 30, calories: 150, steps: 5000 });

  const add = () => {
    if (!f.activity) return toast.error("Activity required");
    Fitness.add({ id: uid(), userId, ...f, date: new Date().toISOString() });
    toast.success("Logged");
  };

  const chartData = logs.slice(0, 14).reverse().map((l) => ({ d: l.date.slice(5, 10), steps: l.steps ?? 0, cal: l.calories }));

  return (
    <div>
      <PageHeader title="Fitness" description="Movement makes the meds work better." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Log activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Activity</Label><Input value={f.activity} onChange={(e) => setF({ ...f, activity: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Duration (min)</Label><Input type="number" value={f.duration} onChange={(e) => setF({ ...f, duration: +e.target.value })} /></div>
              <div><Label>Calories</Label><Input type="number" value={f.calories} onChange={(e) => setF({ ...f, calories: +e.target.value })} /></div>
            </div>
            <div><Label>Steps</Label><Input type="number" value={f.steps} onChange={(e) => setF({ ...f, steps: +e.target.value })} /></div>
            <Button className="w-full" onClick={add}>Save</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Steps (last entries)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Bar dataKey="steps" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 space-y-2">
        {logs.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
            <div>
              <div className="font-medium">{l.activity}</div>
              <div className="text-xs text-muted-foreground">{new Date(l.date).toLocaleDateString()} · {l.duration} min · {l.calories} cal · {l.steps} steps</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => Fitness.remove(l.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
