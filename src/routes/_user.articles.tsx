import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Articles } from "@/lib/storage";

export const Route = createFileRoute("/_user/articles")({
  component: Page,
  head: () => ({ meta: [{ title: "Health articles — MediPulse" }, { name: "description", content: "Tips and guides from your care team." }] }),
});

function Page() {
  const items = useLive(() => Articles.published(), []);
  const [q, setQ] = useState("");
  const filtered = items.filter(
    (a) => !q || a.title.toLowerCase().includes(q.toLowerCase()) || a.category.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader title="Health articles" description="Tips, guides, and wellness content." />
      <Input
        placeholder="Search articles..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-xs mb-4"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <Badge variant="secondary">{a.category}</Badge>
              </div>
              <h3 className="font-semibold">{a.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-4">{a.content}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                {new Date(a.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground">No articles found.</div>
        )}
      </div>
    </div>
  );
}
