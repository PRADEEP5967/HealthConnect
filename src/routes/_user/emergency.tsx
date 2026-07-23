import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Emergency, type EmergencyProfile } from "@/lib/storage";

export const Route = createFileRoute("/_user/emergency")({
  component: Page,
  head: () => ({ meta: [{ title: "Emergency — MediPulse" }, { name: "description", content: "Emergency medical profile." }] }),
});

function Page() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [p, setP] = useState<EmergencyProfile>({
    userId, bloodGroup: "", allergies: "", conditions: "", medications: "", contactName: "", contactPhone: "", contactRelation: "",
  });

  useEffect(() => {
    const cur = Emergency.forUser(userId);
    if (cur) setP(cur);
  }, [userId]);

  const save = () => {
    Emergency.save(p);
    toast.success("Emergency profile saved");
  };

  return (
    <div>
      <PageHeader title="Emergency profile" description="Life-saving info first responders can act on." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-destructive" /> Medical</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div><Label>Blood group</Label><Input value={p.bloodGroup} onChange={(e) => setP({ ...p, bloodGroup: e.target.value })} /></div>
            <div><Label>Allergies</Label><Input value={p.allergies} onChange={(e) => setP({ ...p, allergies: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Chronic conditions</Label><Textarea value={p.conditions} onChange={(e) => setP({ ...p, conditions: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Current medications</Label><Textarea value={p.medications} onChange={(e) => setP({ ...p, medications: e.target.value })} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Emergency contact</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Name</Label><Input value={p.contactName} onChange={(e) => setP({ ...p, contactName: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={p.contactPhone} onChange={(e) => setP({ ...p, contactPhone: e.target.value })} /></div>
            <div><Label>Relation</Label><Input value={p.contactRelation} onChange={(e) => setP({ ...p, contactRelation: e.target.value })} /></div>
            {p.verifiedByAdmin && <Badge variant="secondary">Verified by admin</Badge>}
            <Button className="w-full" onClick={save}>Save profile</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
