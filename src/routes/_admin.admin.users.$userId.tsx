import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound, Trash2 } from "lucide-react";
import { useLive } from "@/lib/useLive";
import {
  Users, Metrics, Medications, Appointments, Documents, Fitness, Sleep, Nutrition,
  hashPassword, Activity, type User,
} from "@/lib/storage";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_admin/admin/users/$userId")({
  ssr: false,
  component: Page,
  head: () => ({ meta: [{ title: "User detail — Admin" }] }),
});

function Page() {
  const { userId } = Route.useParams();
  const nav = useNavigate();
  const { user: admin } = useAuth();
  const user = useLive(() => Users.byId(userId), null as User | null);
  const [edit, setEdit] = useState({ name: "", email: "", age: 0, gender: "", phone: "", bloodGroup: "" });
  const [pw, setPw] = useState("");

  const metrics = useLive(() => Metrics.forUser(userId), []);
  const meds = useLive(() => Medications.forUser(userId), []);
  const appts = useLive(() => Appointments.forUser(userId), []);
  const docs = useLive(() => Documents.forUser(userId), []);
  const fit = useLive(() => Fitness.forUser(userId), []);
  const sleep = useLive(() => Sleep.forUser(userId), []);
  const nut = useLive(() => Nutrition.forUser(userId), []);

  if (!user) return <div className="text-muted-foreground">User not found.</div>;

  const startEdit = () => setEdit({
    name: user.name, email: user.email, age: user.age ?? 0, gender: user.gender ?? "",
    phone: user.phone ?? "", bloodGroup: user.bloodGroup ?? "",
  });

  const saveEdit = () => {
    Users.update(userId, edit);
    toast.success("Profile updated");
  };

  const resetPw = async () => {
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    Users.update(userId, { passwordHash: await hashPassword(pw) });
    if (admin) Activity.log(admin.id, "ADMIN_RESET_PW", `Reset password for ${user.name}`);
    setPw("");
    toast.success("Password reset");
  };

  const del = () => {
    Users.remove(userId);
    if (admin) Activity.log(admin.id, "ADMIN_DELETE_USER", `Deleted ${user.name}`);
    toast.success("User deleted");
    nav({ to: "/admin/users" });
  };

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => nav({ to: "/admin/users" })}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to users
      </Button>
      <PageHeader
        title={user.name}
        description={`${user.email} · ${user.role} · ${user.status}`}
      >
        <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Name</Label><Input value={edit.name || user.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} onFocus={startEdit} /></div>
            <div><Label>Email</Label><Input value={edit.email || user.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} onFocus={startEdit} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Age</Label><Input type="number" value={edit.age || (user.age ?? 0)} onChange={(e) => setEdit({ ...edit, age: +e.target.value })} onFocus={startEdit} /></div>
              <div><Label>Gender</Label><Input value={edit.gender || (user.gender ?? "")} onChange={(e) => setEdit({ ...edit, gender: e.target.value })} onFocus={startEdit} /></div>
            </div>
            <div><Label>Phone</Label><Input value={edit.phone || (user.phone ?? "")} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} onFocus={startEdit} /></div>
            <div><Label>Blood group</Label><Input value={edit.bloodGroup || (user.bloodGroup ?? "")} onChange={(e) => setEdit({ ...edit, bloodGroup: e.target.value })} onFocus={startEdit} /></div>
            <Button className="w-full" onClick={saveEdit}>Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Reset password</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <Button className="w-full" onClick={resetPw}><KeyRound className="h-4 w-4 mr-1" /> Reset password</Button>
            <div className="pt-3 border-t">
              <Button variant="destructive" className="w-full" onClick={del}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete account
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Activity summary</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm">
            <Stat label="Metrics" value={metrics.length} />
            <Stat label="Medications" value={meds.length} />
            <Stat label="Appointments" value={appts.length} />
            <Stat label="Documents" value={docs.length} />
            <Stat label="Fitness logs" value={fit.length} />
            <Stat label="Sleep logs" value={sleep.length} />
            <Stat label="Nutrition logs" value={nut.length} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent medications</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {meds.slice(0, 5).map((m) => (
              <div key={m.id} className="flex justify-between border-b py-1.5">
                <span>{m.name} · {m.dosage}</span>
                <span className="text-muted-foreground">{m.frequency}</span>
              </div>
            ))}
            {meds.length === 0 && <div className="text-muted-foreground">None</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent appointments</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {appts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex justify-between border-b py-1.5">
                <span>{a.doctor} · {a.date}</span>
                <Badge variant="outline">{a.status}</Badge>
              </div>
            ))}
            {appts.length === 0 && <div className="text-muted-foreground">None</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
