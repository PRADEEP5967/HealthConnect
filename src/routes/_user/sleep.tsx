import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLive } from "@/lib/useLive";
import { Sleep, uid } from "@/lib/storage";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export const Route = createFileRoute("/_user/sleep")({
  component: Page,
  head: () => ({ meta: [{ title: "Sleep — MediPulse" }, { name: "description", content: "Track your sleep quality." }] }),
});

function Page() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const logs = useLive(() => Sleep.forUser(userId), []);
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(4);

  const add = () => {
    Sleep.add({ id: uid(), userId, hours, quality, date: new Date().toISOString() });
    toast.success("Sleep logged");
  };

  const data = logs.slice(0, 14).reverse().map((l) => ({ d: l.date.slice(5, 10), h: l.hours, q: l.quality }));

  return (
    <div>
      <PageHeader title="Sleep" description="Rest is medicine." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Log sleep</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Hours</Label><Input type="number" step="0.5" value={hours} onChange={(e) => setHours(+e.target.value)} /></div>
            <div>
              <Label>Quality: {quality}/5</Label>
              <Slider value={[quality]} onValueChange={(v) => setQuality(v[0])} min={1} max={5} step={1} />
            </div>
            <Button className="w-full" onClick={add}>Save</Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Sleep trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Area type="monotone" dataKey="h" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 space-y-2">
        {logs.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
            <div>
              <div className="font-medium">{l.hours.toFixed(1)} h · quality {l.quality}/5</div>
              <div className="text-xs text-muted-foreground">{new Date(l.date).toLocaleDateString()}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => Sleep.remove(l.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
