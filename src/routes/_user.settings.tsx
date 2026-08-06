import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { Users, hashPassword } from "@/lib/storage";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_user/settings")({
  component: Page,
  head: () => ({ meta: [{ title: "Settings — MediPulse" }, { name: "description", content: "Preferences and account settings." }] }),
});

function Page() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [pw, setPw] = useState("");
  const [notif, setNotif] = useState(true);

  const changePw = async () => {
    if (!user) return;
    if (pw.length < 6) return toast.error("Password too short");
    const hash = await hashPassword(pw);
    Users.update(user.id, { passwordHash: hash });
    setPw("");
    toast.success("Password updated");
  };

  return (
    <div>
      <PageHeader title="Settings" description="Preferences and security." />
      <div className="grid gap-4 lg:grid-cols-2 max-w-4xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div><div className="font-medium">Dark mode</div><div className="text-xs text-muted-foreground">Easier on the eyes at night</div></div>
            <Switch checked={theme === "dark"} onCheckedChange={toggle} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div><div className="font-medium">Reminder alerts</div><div className="text-xs text-muted-foreground">Local reminders inside the app</div></div>
            <Switch checked={notif} onCheckedChange={setNotif} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Change password</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-56"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <Button onClick={changePw}>Update password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
