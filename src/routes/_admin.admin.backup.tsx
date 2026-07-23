import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatabaseBackup, Upload, Download } from "lucide-react";
import { exportBackup, importBackup } from "@/lib/storage";

export const Route = createFileRoute("/_admin/admin/backup")({
  component: Page,
  head: () => ({ meta: [{ title: "Backup — Admin" }, { name: "description", content: "Export and restore all platform data." }] }),
});

function Page() {
  const inputRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const data = exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `medipulse-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      importBackup(data);
      toast.success("Backup restored. Reloading...");
      setTimeout(() => location.reload(), 800);
    } catch {
      toast.error("Invalid backup file");
    }
  };

  return (
    <div>
      <PageHeader title="Backup & restore" description="Portable JSON snapshot of the entire platform." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="h-4 w-4" /> Export</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Download every users, records, appointments and log as a single JSON file.</p>
            <Button onClick={doExport} className="gap-2"><DatabaseBackup className="h-4 w-4" /> Export backup</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" /> Restore</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Upload a previously exported backup. This overwrites current data.</p>
            <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={onFile} />
            <Button variant="secondary" onClick={() => inputRef.current?.click()}>Choose file...</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
