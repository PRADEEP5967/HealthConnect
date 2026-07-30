import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — MediPulse" },
      { name: "description", content: "Sign in to your MediPulse patient or admin account." },
    ],
  }),
});

function LoginPage() {
  const nav = useNavigate();
  const { user, ready, login } = useAuth();
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) {
      nav({ to: user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard" });
    }
  }, [ready, user, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password, role);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Welcome back");
    nav({ to: role === "ADMIN" ? "/admin/dashboard" : "/dashboard" });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg animate-scale-in">
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="h-4 w-4" />
          </span>
          MediPulse
        </Link>
        <h1 className="text-2xl font-semibold animate-fade-in-down">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose your role and enter your credentials.</p>

        <Tabs value={role} onValueChange={(v) => setRole(v as "USER" | "ADMIN")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="USER">Patient</TabsTrigger>
            <TabsTrigger value="ADMIN">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value={role}>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <div>
            <b>Admin demo:</b> admin@demo.local / admin123
          </div>
          <div>
            <b>Patient demo:</b> sara@demo.local / user123
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
