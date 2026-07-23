import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Medications, Users } from "@/lib/storage";

export const Route = createFileRoute("/_admin/admin/medications")({
  component: Page,
  head: () => ({ meta: [{ title: "Medications — Admin" }, { name: "description", content: "System-wide medication activity." }] }),
});

function Page() {
  const items = useLive(() => Medications.all(), []);
  const users = useLive(() => Users.all(), []);
  const nameFor = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown";

  return (
    <div>
      <PageHeader title="Medications" description="All prescriptions across the platform." />
      <Card>
        <CardContent className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead><TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead><TableHead>Schedule</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{nameFor(m.userId)}</TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.dosage}</TableCell>
                  <TableCell>{m.frequency} at {m.time}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { Medications.remove(m.id); toast.success("Removed"); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nothing yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
