import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLive } from "@/lib/useLive";
import { Metrics, Activity as ActivityLog, uid } from "@/lib/storage";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export const Route = createFileRoute("/_user/health")({
  component: HealthPage,
  head: () => ({ meta: [{ title: "Health metrics — MediPulse" }, { name: "description", content: "Log and track your vitals." }] }),
});

function HealthPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const metrics = useLive(() => Metrics.forUser(userId), []);
  const [type, setType] = useState<"bp" | "sugar" | "weight" | "heart" | "bmi">("bp");
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [val, setVal] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const add = () => {
    const base = { id: uid(), userId, date: new Date().toISOString() };
    if (type === "bp") {
      if (!sys || !dia) return toast.error("Enter systolic and diastolic");
      Metrics.add({ ...base, type, systolic: Number(sys), diastolic: Number(dia) });
    } else if (type === "bmi") {
      if (!val || !heightCm) return toast.error("Enter weight and height");
      const h = Number(heightCm) / 100;
      const bmi = Number((Number(val) / (h * h)).toFixed(1));
      Metrics.add({ ...base, type: "bmi", value: bmi, unit: "kg/m²", note: `H ${heightCm}cm` });
    } else {
      if (!val) return toast.error("Enter a value");
      const unit = type === "weight" ? "kg" : type === "sugar" ? "mg/dL" : "bpm";
      Metrics.add({ ...base, type, value: Number(val), unit });
    }
    ActivityLog.log(userId, "HEALTH_RECORD_ADDED", `Logged ${type}`);
    setSys(""); setDia(""); setVal(""); setHeightCm("");
    toast.success("Recorded");
  };

  return (
    <div>
      <PageHeader title="Health metrics" description="Track vitals over time." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Add reading</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bp">Blood pressure</SelectItem>
                  <SelectItem value="sugar">Blood sugar</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="heart">Heart rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === "bp" ? (
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Systolic</Label><Input value={sys} onChange={(e) => setSys(e.target.value)} type="number" /></div>
                <div><Label>Diastolic</Label><Input value={dia} onChange={(e) => setDia(e.target.value)} type="number" /></div>
              </div>
            ) : type === "bmi" ? (
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Weight (kg)</Label><Input value={val} onChange={(e) => setVal(e.target.value)} type="number" /></div>
                <div><Label>Height (cm)</Label><Input value={heightCm} onChange={(e) => setHeightCm(e.target.value)} type="number" /></div>
              </div>
            ) : (
              <div><Label>Value</Label><Input value={val} onChange={(e) => setVal(e.target.value)} type="number" /></div>
            )}
            <Button className="w-full" onClick={add}>Save reading</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader>
          <CardContent>
            {(() => {
              const weightData = metrics.filter((m) => m.type === "weight").slice().reverse().map((m) => ({ d: m.date.slice(5, 10), v: m.value }));
              return weightData.length > 1 ? (
                <div className="h-40 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="d" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                      <Line type="monotone" dataKey="v" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : null;
            })()}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No readings yet</TableCell></TableRow>
                )}
                {metrics.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{m.type}</TableCell>
                    <TableCell>
                      {m.type === "bp" ? `${m.systolic}/${m.diastolic}` : `${Math.round((m.value ?? 0) * 10) / 10} ${m.unit ?? ""}`}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => Metrics.remove(m.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
