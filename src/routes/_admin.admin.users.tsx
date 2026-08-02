import { createFileRoute, Link } from "@tanstack/react-router";
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
import { Trash2, KeyRound, Eye } from "lucide-react";
import { useLiveLoading } from "@/lib/useLive";
import { Users, Activity } from "@/lib/storage";
import { adminResetPassword, adminDeleteUser } from "@/lib/admin.functions";
import { syncDirectory } from "@/lib/cloud";
import { useAuth } from "@/lib/auth";
import { TableSkeleton } from "@/components/page-skeleton";
import { AnimateIn } from "@/components/animate-in";

export const Route = createFileRoute("/_admin/admin/users")({
  component: Page,
  head: () => ({ meta: [{ title: "Users — Admin" }, { name: "description", content: "Manage patient accounts." }] }),
});

function Page() {
  const { user: admin } = useAuth();
  const { data: users, loading } = useLiveLoading(() => Users.all(), []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = users.filter((u) =>
    (status === "all" || u.status === status) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
  );

  const resetPw = async (id: string) => {
    try {
      await adminResetPassword({ data: { userId: id, password: "temp123" } });
      if (admin) Activity.log(admin.id, "ADMIN_RESET_PW", `Reset password for ${id}`);
      toast.success("Password reset to temp123");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reset password");
    }
  };

  const removeUser = async (id: string, name: string) => {
    try {
      await adminDeleteUser({ data: { userId: id } });
      Users.remove(id);
      if (admin) Activity.log(admin.id, "ADMIN_DELETE_USER", `Deleted ${name}`);
      await syncDirectory();
      toast.success("Deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete user");
    }
  };

  return (
    <div>
      <PageHeader title="User management" description="View and manage all accounts." />
      <AnimateIn variant="fade-in-up">
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
          {loading ? (
            <TableSkeleton rows={6} />
          ) : (
          <div className="overflow-x-auto">
            <Table className="responsive-table">
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
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No users found</TableCell></TableRow>
                )}
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell data-label="Name" className="font-medium">{u.name}</TableCell>
                    <TableCell data-label="Email">{u.email}</TableCell>
                    <TableCell data-label="Role"><Badge variant="outline">{u.role}</Badge></TableCell>
                    <TableCell data-label="Status"><Badge variant={u.status === "active" ? "default" : "secondary"}>{u.status}</Badge></TableCell>
                    <TableCell data-label="Registered">{new Date(u.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell data-label="Actions" className="text-right">
                      <Button asChild variant="ghost" size="sm"><Link to="/admin/users/$userId" params={{ userId: u.id }}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="sm" onClick={() => { Users.update(u.id, { status: u.status === "active" ? "inactive" : "active" }); toast.success(`User ${u.status === "active" ? "deactivated" : "activated"}`); }}>
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => resetPw(u.id)}><KeyRound className="h-4 w-4" /></Button>
                      {u.role !== "ADMIN" && (
                        <Button variant="ghost" size="sm" onClick={() => removeUser(u.id, u.name)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
