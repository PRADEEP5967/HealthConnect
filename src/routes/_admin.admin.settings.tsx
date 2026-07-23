import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, type SystemSettings } from "@/lib/storage";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: Page,
  head: () => ({ meta: [{ title: "Settings — Admin" }, { name: "description", content: "System-level configuration." }] }),
});

function Page() {
  const [s, setS] = useState<SystemSettings | null>(null);
  useEffect(() => setS(Settings.get()), []);
  if (!s) return null;
  const save = () => { Settings.save(s); toast.success("Settings saved"); };

  return (
    <div>
      <PageHeader title="System settings" description="Global platform configuration." />
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><label className="text-sm">App name</label><Input value={s.appName} onChange={(e) => setS({ ...s, appName: e.target.value })} /></div>
          <div><label className="text-sm">Tagline</label><Input value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></div>
          <div><label className="text-sm">Categories (comma separated)</label>
            <Textarea value={s.categories.join(", ")} onChange={(e) => setS({ ...s, categories: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Notifications enabled</span>
            <Switch checked={s.notificationsEnabled} onCheckedChange={(v) => setS({ ...s, notificationsEnabled: v })} />
          </div>
          <Button onClick={save}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
