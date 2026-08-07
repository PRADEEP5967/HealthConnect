import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { useLive } from "@/lib/useLive";
import { Goals, uid, type HealthGoal } from "@/lib/storage";
import { getGoalProgress, goalLabel } from "@/lib/insights";
import { AnimateIn } from "@/components/animate-in";
import { Target, Plus, Trash2, Footprints, Moon, Droplets, Dumbbell, Apple } from "lucide-react";

export const Route = createFileRoute("/_user/goals")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Health goals — MediPulse" },
      { name: "description", content: "Set and track your daily health goals." },
    ],
  }),
});

const goalIcons: Record<HealthGoal["type"], React.ReactNode> = {
  steps: <Footprints className="h-5 w-5" />,
  sleep: <Moon className="h-5 w-5" />,
  water: <Droplets className="h-5 w-5" />,
  exercise: <Dumbbell className="h-5 w-5" />,
  calories: <Apple className="h-5 w-5" />,
};

const goalUnits: Record<HealthGoal["type"], string> = {
  steps: "steps",
  sleep: "hours",
  water: "glasses",
  exercise: "minutes",
  calories: "kcal",
};

const goalDefaults: Record<HealthGoal["type"], number> = {
  steps: 10000,
  sleep: 8,
  water: 8,
  exercise: 30,
  calories: 2000,
};

function Page() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const goals = useLive(() => Goals.forUser(userId), [] as HealthGoal[]);
  const progress = useLive(() => getGoalProgress(userId), [], [goals.length]);

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<HealthGoal["type"]>("steps");
  const [target, setTarget] = useState("10000");

  const addGoal = () => {
    const t = parseInt(target, 10);
    if (!t || t <= 0) {
      toast.error("Please enter a valid target");
      return;
    }
    const existing = goals.find((g) => g.type === type);
    if (existing) {
      Goals.update(existing.id, { target: t });
      toast.success(`${goalLabel(type)} goal updated`);
    } else {
      Goals.add({
        id: uid(),
        userId,
        type,
        target: t,
        unit: goalUnits[type],
        createdAt: new Date().toISOString(),
      });
      toast.success(`${goalLabel(type)} goal created`);
    }
    setShowForm(false);
  };

  const removeGoal = (id: string) => {
    Goals.remove(id);
    toast.success("Goal removed");
  };

  return (
    <div>
      <PageHeader title="Health goals" description="Set daily targets and track your progress in real time.">
        <Button size="sm" onClick={() => { setShowForm(!showForm); setTarget(String(goalDefaults[type])); }}>
          <Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "New goal"}
        </Button>
      </PageHeader>

      {showForm && (
        <AnimateIn variant="fade-in-up">
          <Card className="mb-4">
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Goal type</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => {
                      setType(v as HealthGoal["type"]);
                      setTarget(String(goalDefaults[v as HealthGoal["type"]]));
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steps">Daily steps</SelectItem>
                      <SelectItem value="sleep">Sleep hours</SelectItem>
                      <SelectItem value="water">Water intake</SelectItem>
                      <SelectItem value="exercise">Exercise minutes</SelectItem>
                      <SelectItem value="calories">Calories consumed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Daily target ({goalUnits[type]})</Label>
                  <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} min={1} />
                </div>
              </div>
              <Button onClick={addGoal}><Target className="h-4 w-4 mr-1" /> Save goal</Button>
            </CardContent>
          </Card>
        </AnimateIn>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {progress.length === 0 && !showForm && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-10 w-10 text-muted-foreground mb-3" />
              <div className="font-medium">No goals yet</div>
              <div className="text-sm text-muted-foreground mt-1">Create your first health goal to start tracking progress.</div>
              <Button className="mt-4" onClick={() => { setShowForm(true); setTarget(String(goalDefaults.steps)); }}>
                <Plus className="h-4 w-4 mr-1" /> Create goal
              </Button>
            </CardContent>
          </Card>
        )}

        {progress.map((p, i) => (
          <AnimateIn key={p.goal.id} variant="fade-in-up" delay={i * 50}>
            <Card className="transition-shadow duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {goalIcons[p.goal.type]}
                  {p.label}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeGoal(p.goal.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold tabular-nums">{p.current.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/ {p.goal.target.toLocaleString()} {p.unit}</span>
                </div>
                <Progress value={p.percent} className="h-2" />
                <div className="flex items-center justify-between">
                  <Badge variant={p.percent >= 100 ? "default" : p.percent >= 50 ? "secondary" : "outline"}>
                    {p.percent >= 100 ? "Achieved" : p.percent >= 50 ? "On track" : "Behind"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{p.percent}% complete</span>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
        ))}
      </div>
    </div>
  );
}
