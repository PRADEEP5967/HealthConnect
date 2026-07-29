import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, CircleCheck as CheckCircle2 } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Emergency, Users, Activity } from "@/lib/storage";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_admin/admin/emergency")({
  component: Page,
  head: () => ({ meta: [{ title: "Emergency — Admin" }, { name: "description", content: "Review patient emergency profiles." }] }),
});

function Page() {
  const { user: admin } = useAuth();
  const users = useLive(() => Users.all().filter((u) => u.role === "USER"), []);
  const all = useLive(() => Emergency.all(), []);
  const [uidSel, setUidSel] = useState<string>("");

  const profile = all.find((p) => p.userId === uidSel);
  const userName = users.find((u) => u.id === uidSel)?.name ?? "Unknown";

  const verify = () => {
    if (!profile || !admin) return;
    Emergency.save({ ...profile, verifiedByAdmin: true });
    Activity.log(admin.id, "ADMIN_EMERGENCY_VERIFY", `Verified emergency profile for ${userName}`);
    toast.success("Emergency profile verified");
  };

  const unverify = () => {
    if (!profile) return;
    Emergency.save({ ...profile, verifiedByAdmin: false });
    toast.info("Verification removed");
  };

  return (
    <div>
      <PageHeader title="Emergency management" description="Review and verify patient emergency profiles." />
      <Card className="mb-4">
        <CardContent className="p-4">
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

      {uidSel && profile && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" /> Medical — {userName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Blood group" value={profile.bloodGroup || "—"} />
              <Row label="Allergies" value={profile.allergies || "—"} />
              <Row label="Conditions" value={profile.conditions || "—"} />
              <Row label="Medications" value={profile.medications || "—"} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Emergency contact</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Name" value={profile.contactName || "—"} />
              <Row label="Phone" value={profile.contactPhone || "—"} />
              <Row label="Relation" value={profile.contactRelation || "—"} />
              <div className="flex items-center gap-2 pt-2">
                {profile.verifiedByAdmin
                  ? <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
                  : <Badge variant="secondary">Unverified</Badge>}
              </div>
              <div className="flex gap-2 pt-2">
                {!profile.verifiedByAdmin
                  ? <Button size="sm" onClick={verify}>Mark verified</Button>
                  : <Button size="sm" variant="outline" onClick={unverify}>Remove verification</Button>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {uidSel && !profile && (
        <div className="text-sm text-muted-foreground">This patient hasn't filled in an emergency profile yet.</div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
