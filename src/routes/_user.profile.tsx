import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Users } from "@/lib/storage";

export const Route = createFileRoute("/_user/profile")({
  component: Page,
  head: () => ({ meta: [{ title: "Profile — MediPulse" }, { name: "description", content: "Manage your patient profile." }] }),
});

function Page() {
  const { user, refresh } = useAuth();
  const [f, setF] = useState({ name: "", email: "", age: 0, gender: "", phone: "", bloodGroup: "" });

  useEffect(() => {
    if (user) setF({
      name: user.name, email: user.email, age: user.age ?? 0, gender: user.gender ?? "",
      phone: user.phone ?? "", bloodGroup: user.bloodGroup ?? "",
    });
  }, [user]);

  const save = () => {
    if (!user) return;
    Users.update(user.id, { ...f });
    refresh();
    toast.success("Profile updated");
  };

  return (
    <div>
      <PageHeader title="Your profile" description="Keep your details up to date." />
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-base">Personal info</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><Label>Age</Label><Input type="number" value={f.age} onChange={(e) => setF({ ...f, age: +e.target.value })} /></div>
          <div><Label>Gender</Label><Input value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><Label>Blood group</Label><Input value={f.bloodGroup} onChange={(e) => setF({ ...f, bloodGroup: e.target.value })} /></div>
          <div className="sm:col-span-2"><Button onClick={save}>Save changes</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
