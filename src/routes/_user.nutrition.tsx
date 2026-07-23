import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLive } from "@/lib/useLive";
import { Nutrition, uid } from "@/lib/storage";

export const Route = createFileRoute("/_user/nutrition")({
  component: Page,
  head: () => ({ meta: [{ title: "Nutrition — MediPulse" }, { name: "description", content: "Log meals and calories." }] }),
});

function Page() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const logs = useLive(() => Nutrition.forUser(userId), []);
  const [f, setF] = useState({ meal: "Breakfast", food: "", calories: 0 });

  const add = () => {
    if (!f.food) return toast.error("Food required");
    Nutrition.add({ id: uid(), userId, ...f, date: new Date().toISOString() });
    setF({ meal: "Breakfast", food: "", calories: 0 });
    toast.success("Logged");
  };

  const today = new Date().toDateString();
  const todayCals = logs.filter((l) => new Date(l.date).toDateString() === today).reduce((s, l) => s + l.calories, 0);

  return (
    <div>
      <PageHeader title="Nutrition" description="Small food, big impact." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Log meal</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Meal</Label>
              <Select value={f.meal} onValueChange={(v) => setF({ ...f, meal: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Food</Label><Input value={f.food} onChange={(e) => setF({ ...f, food: e.target.value })} /></div>
            <div><Label>Calories</Label><Input type="number" value={f.calories} onChange={(e) => setF({ ...f, calories: +e.target.value })} /></div>
            <Button className="w-full" onClick={add}>Add</Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Today: {todayCals} kcal</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {logs.length === 0 && <div className="text-sm text-muted-foreground">Nothing logged.</div>}
            {logs.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{l.food}</div>
                  <div className="text-xs text-muted-foreground">{l.meal} · {new Date(l.date).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{l.calories} kcal</span>
                  <Button variant="ghost" size="icon" onClick={() => Nutrition.remove(l.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
