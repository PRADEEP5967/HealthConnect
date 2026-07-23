import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Notifications, Users, uid } from "@/lib/storage";

export const Route = createFileRoute("/_admin/admin/notifications")({
  component: Page,
  head: () => ({ meta: [{ title: "Notifications — Admin" }, { name: "description", content: "Broadcast messages to users." }] }),
});

function Page() {
  const users = useLive(() => Users.all().filter((u) => u.role === "USER"), []);
  const items = useLive(() => Notifications.all(), []);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");

  const send = () => {
    if (!title || !body) return toast.error("Title and body required");
    Notifications.add({ id: uid(), title, body, audience, createdAt: new Date().toISOString() });
    setTitle(""); setBody("");
    toast.success("Notification sent");
  };

  return (
    <div>
      <PageHeader title="Notifications" description="Send announcements and tips." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">New notification</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Message..." value={body} onChange={(e) => setBody(e.target.value)} />
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All patients</SelectItem>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={send}>Send</Button>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-2">
          {items.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()} · to {n.audience === "all" ? "everyone" : users.find((u) => u.id === n.audience)?.name}</div>
                  <div className="mt-1 text-sm">{n.body}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => Notifications.remove(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && <div className="text-sm text-muted-foreground">No notifications yet.</div>}
        </div>
      </div>
    </div>
  );
}
