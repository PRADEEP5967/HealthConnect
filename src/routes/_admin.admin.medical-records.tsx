import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Documents, Users } from "@/lib/storage";

export const Route = createFileRoute("/_admin/admin/medical-records")({
  component: Page,
  head: () => ({ meta: [{ title: "Medical records — Admin" }, { name: "description", content: "Review uploaded medical documents." }] }),
});

function Page() {
  const docs = useLive(() => Documents.all(), []);
  const users = useLive(() => Users.all(), []);
  const nameFor = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown";

  return (
    <div>
      <PageHeader title="Medical records" description="Documents uploaded by patients." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{nameFor(d.userId)} · {d.category}</div>
                  <div className="text-xs text-muted-foreground">{new Date(d.uploadDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button asChild variant="secondary" size="sm" className="flex-1"><a href={d.dataUrl} download={d.name}><Download className="h-4 w-4 mr-1" />Download</a></Button>
                <Button variant="ghost" size="icon" onClick={() => { Documents.remove(d.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {docs.length === 0 && <div className="text-sm text-muted-foreground">No records yet.</div>}
      </div>
    </div>
  );
}
