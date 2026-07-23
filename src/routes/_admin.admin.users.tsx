import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, KeyRound } from "lucide-react";
import { useLive } from "@/lib/useLive";
import { Users, hashPassword, Activity } from "@/lib/storage";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_admin/admin/users")({
  component: Page,
  head: () => ({ meta: [{ title: "Users — Admin" }, { name: "description", content: "Manage patient accounts." }] }),
});

function Page() {
  const { user: admin } = useAuth();
  const users = useLive(() => Users.all(), []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = users.filter((u) =>
    (status === "all" || u.status === status) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
  );

  const resetPw = async (id: string) => {
    Users.update(id, { passwordHash: await hashPassword("temp123") });
    if (admin) Activity.log(admin.id, "ADMIN_RESET_PW", `Reset password for ${id}`);
    toast.success("Password reset to temp123");
  };

  return (
    <div>
      <PageHeader title="User management" description="View and manage all accounts." />
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <Input placeholder="Search name or email..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                    <TableCell><Badge variant={u.status === "active" ? "default" : "secondary"}>{u.status}</Badge></TableCell>
                    <TableCell>{new Date(u.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => Users.update(u.id, { status: u.status === "active" ? "inactive" : "active" })}>
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => resetPw(u.id)}><KeyRound className="h-4 w-4" /></Button>
                      {u.role !== "ADMIN" && (
                        <Button variant="ghost" size="sm" onClick={() => { Users.remove(u.id); toast.success("Deleted"); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
