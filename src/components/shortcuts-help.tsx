import { useState, useEffect, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ShortcutEntry = {
  key: string;
  description: string;
  ctrl?: boolean;
  shift?: boolean;
};

export function ShortcutsHelp({
  shortcuts,
  children,
}: {
  shortcuts: ShortcutEntry[];
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Keyboard shortcuts">
        <Keyboard className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>Use these shortcuts to navigate faster.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50">
                <span className="text-sm">{s.description}</span>
                <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">
                  {s.ctrl ? "⌘/" : ""}{s.shift ? "⇧" : ""}{s.key.toUpperCase()}
                </kbd>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50">
              <span className="text-sm">Toggle sidebar</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">⌘B</kbd>
            </div>
            <div className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50">
              <span className="text-sm">Show this help</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">⌘⇧?</kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
}
