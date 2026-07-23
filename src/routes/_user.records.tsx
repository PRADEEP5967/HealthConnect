import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLive } from "@/lib/useLive";
import { Documents, uid } from "@/lib/storage";

export const Route = createFileRoute("/_user/records")({
  component: Page,
  head: () => ({ meta: [{ title: "Medical records — MediPulse" }, { name: "description", content: "Store and manage your medical records." }] }),
});

function Page() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const docs = useLive(() => Documents.forUser(userId), []);
  const [category, setCategory] = useState("Report");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Files must be under 2 MB (localStorage limit).");
    const dataUrl = await new Promise<string>((r, j) => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result as string);
      fr.onerror = j;
      fr.readAsDataURL(file);
    });
    Documents.add({
      id: uid(),
      userId,
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl,
      category,
      uploadDate: new Date().toISOString(),
    });
    toast.success("Uploaded");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <PageHeader title="Medical records" description="Prescriptions, reports and documents." />
      <Card>
        <CardHeader><CardTitle className="text-base">Upload document</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-40"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} /></div>
          <div className="flex-1 min-w-40">
            <Label>File</Label>
            <Input ref={fileRef} type="file" onChange={onFile} />
          </div>
          <Button variant="secondary" className="gap-2" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Choose file</Button>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {docs.length === 0 && <div className="text-sm text-muted-foreground">No documents yet.</div>}
        {docs.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.category} · {(d.size / 1024).toFixed(0)} KB</div>
                  <div className="text-xs text-muted-foreground">{new Date(d.uploadDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button asChild variant="secondary" size="sm" className="flex-1">
                  <a href={d.dataUrl} download={d.name}><Download className="h-4 w-4 mr-1" />Download</a>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => Documents.remove(d.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
