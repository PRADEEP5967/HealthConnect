import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatabaseBackup, Upload, Download, ShieldCheck, RotateCcw, Trash2 } from "lucide-react";
import { exportBackup, importBackup } from "@/lib/storage";
import {
  runIntegrityCheck,
  getRepairLog,
  listBackups,
  restoreBackup,
  deleteBackup,
  clearRepairLog,
  type RepairEntry,
} from "@/lib/schema";

export const Route = createFileRoute("/_admin/admin/backup")({
  component: Page,
  head: () => ({ meta: [{ title: "Backup — Admin" }, { name: "description", content: "Export and restore all platform data." }] }),
});

const reasonLabel: Record<RepairEntry["reason"], string> = {
  unparsable: "Partially written / unreadable",
  "wrong-shape": "Unexpected shape",
  "invalid-items": "Invalid entries removed",
};

function Page() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [log, setLog] = useState<RepairEntry[]>([]);
  const [backups, setBackups] = useState<ReturnType<typeof listBackups>>([]);

  const refresh = () => {
    setLog(getRepairLog());
    setBackups(listBackups());
  };
  useEffect(() => { refresh(); }, []);

  const scan = () => {
    const repairs = runIntegrityCheck();
    refresh();
    if (repairs.length === 0) toast.success("All stored data passed validation");
    else toast.warning(`Repaired ${repairs.length} store(s); originals were backed up`);
  };


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

      <Card className="mt-4">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Data integrity</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={scan}>Run check</Button>
            {log.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => { clearRepairLog(); refresh(); }}>Clear log</Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Stored records and profiles are validated against their schema on every app start. Corrupted or partially
            written data is copied to a safety backup, then repaired automatically.
          </p>

          <div>
            <h3 className="mb-2 text-sm font-medium">Repair history</h3>
            {log.length === 0 ? (
              <p className="text-sm text-muted-foreground">No repairs recorded — all stores are valid.</p>
            ) : (
              <ul className="space-y-2">
                {log.map((r, i) => (
                  <li key={`${r.key}-${r.at}-${i}`} className="rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{r.label}</span>
                      <Badge variant="secondary">{reasonLabel[r.reason]}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(r.at).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.removed} discarded · {r.kept} kept{r.backupKey ? " · original backed up" : " · backup unavailable"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Quarantined backups</h3>
            {backups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quarantined data.</p>
            ) : (
              <ul className="space-y-2">
                {backups.map((b) => (
                  <li key={b.key} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{b.sourceKey}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.at ? new Date(b.at).toLocaleString() : "unknown time"} · {(b.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="gap-1"
                        onClick={() => { restoreBackup(b.key) ? toast.success("Restored (revalidated)") : toast.error("Could not restore"); refresh(); }}>
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1"
                        onClick={() => { deleteBackup(b.key); refresh(); }}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
