import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Articles, uid } from "@/lib/storage";

export const Route = createFileRoute("/_admin/admin/content")({
  component: Page,
  head: () => ({ meta: [{ title: "Content — Admin" }, { name: "description", content: "Manage articles and health tips." }] }),
});

function Page() {
  const items = useLive(() => Articles.all(), []);
  const [f, setF] = useState({ title: "", category: "General", content: "", published: true });

  const add = () => {
    if (!f.title) return toast.error("Title required");
    Articles.add({ id: uid(), createdAt: new Date().toISOString(), ...f });
    setF({ title: "", category: "General", content: "", published: true });
    toast.success("Article added");
  };

  return (
    <div>
      <PageHeader title="Content" description="Health articles, tips, and guides." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">New article</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            <Input placeholder="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
            <Textarea placeholder="Content..." rows={6} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} />
            <div className="flex items-center justify-between">
              <span className="text-sm">Publish</span>
              <Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} />
            </div>
            <Button className="w-full" onClick={add}>Create article</Button>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-3">
          {items.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.category} · {new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.published ? "default" : "secondary"}>{a.published ? "Published" : "Draft"}</Badge>
                    <Switch checked={a.published} onCheckedChange={(v) => Articles.update(a.id, { published: v })} />
                    <Button variant="ghost" size="icon" onClick={() => Articles.remove(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{a.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
