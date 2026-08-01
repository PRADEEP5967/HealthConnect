import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, CheckCheck } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Notifications } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_user/notifications")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Notifications — MediPulse" },
      { name: "description", content: "Announcements and reminders from your care team." },
      { property: "og:title", content: "Notifications — MediPulse" },
      { property: "og:description", content: "Announcements and reminders from your care team." },
    ],
  }),
});

function Page() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const items = useLive(() => (uid ? Notifications.forUser(uid) : []), [], [uid]);
  const [q, setQ] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const unread = items.filter((n) => !n.read?.[uid]).length;
  const filtered = items.filter((n) => {
    if (onlyUnread && n.read?.[uid]) return false;
    if (!q) return true;
    const t = q.toLowerCase();
    return n.title.toLowerCase().includes(t) || n.body.toLowerCase().includes(t);
  });

  const markAll = () => {
    items.forEach((n) => {
      if (!n.read?.[uid]) Notifications.markRead(n.id, uid);
    });
    toast.success("All marked as read");
  };

  return (
    <div>
      <PageHeader title="Notifications" description="Announcements and reminders from your care team.">
        <Button variant="outline" size="sm" onClick={() => setOnlyUnread((v) => !v)}>
          {onlyUnread ? "Show all" : `Unread only${unread ? ` (${unread})` : ""}`}
        </Button>
        <Button size="sm" onClick={markAll} disabled={unread === 0}>
          <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
        </Button>
      </PageHeader>

      <Input
        placeholder="Search notifications…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-4 max-w-sm"
      />

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Bell className="h-6 w-6" />
              <p className="text-sm">Nothing here yet.</p>
            </CardContent>
          </Card>
        )}
        {filtered.map((n) => {
          const isUnread = !n.read?.[uid];
          return (
            <Card key={n.id} className={isUnread ? "border-primary/40" : undefined}>
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{n.title}</span>
                    {isUnread && <Badge variant="secondary">New</Badge>}
                  </div>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {isUnread && (
                  <Button variant="ghost" size="sm" onClick={() => Notifications.markRead(n.id, uid)}>
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
