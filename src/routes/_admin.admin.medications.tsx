import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useLiveLoading } from "@/lib/useLive";
import { Medications, Users } from "@/lib/storage";
import { TableSkeleton } from "@/components/page-skeleton";
import { AnimateIn } from "@/components/animate-in";

export const Route = createFileRoute("/_admin/admin/medications")({
  component: Page,
  head: () => ({ meta: [{ title: "Medications — Admin" }, { name: "description", content: "System-wide medication activity." }] }),
});

function Page() {
  const { data: items, loading } = useLiveLoading(() => Medications.all(), []);
  const users = useLiveLoading(() => Users.all(), []);
  const nameFor = (id: string) => users.data.find((u) => u.id === id)?.name ?? "Unknown";

  return (
    <div>
      <PageHeader title="Medications" description="All prescriptions across the platform." />
      <AnimateIn variant="fade-in-up">
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <TableSkeleton rows={5} />
            ) : (
              <div className="overflow-x-auto">
                <Table className="responsive-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead><TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead><TableHead>Schedule</TableHead>
                      <TableHead>Reminder</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell data-label="Patient" className="font-medium">{nameFor(m.userId)}</TableCell>
                        <TableCell data-label="Medication" className="font-medium">{m.name}</TableCell>
                        <TableCell data-label="Dosage">{m.dosage}</TableCell>
                        <TableCell data-label="Schedule">{m.frequency} at {m.time}</TableCell>
                        <TableCell data-label="Reminder">{m.reminder ? <Badge variant="default">On</Badge> : <Badge variant="secondary">Off</Badge>}</TableCell>
                        <TableCell data-label="Actions" className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { Medications.remove(m.id); toast.success("Removed"); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nothing yet</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimateIn>
    </div>
  );
}
