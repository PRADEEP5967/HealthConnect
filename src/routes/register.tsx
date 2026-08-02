import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  ssr: false,
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create account — MediPulse" },
      { name: "description", content: "Create your MediPulse patient account in seconds." },
    ],
  }),
});

function RegisterPage() {
  const nav = useNavigate();
  const { user, ready, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) nav({ to: user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard" });
  }, [ready, user, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    const res = await register({ name, email, password, role: "USER" });
    setLoading(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Account created");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg animate-scale-in">
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm font-semibold">
          <img src="/logo.svg" alt="MediPulse" className="h-8 w-8 rounded-lg" />
          MediPulse
        </Link>
        <h1 className="text-2xl font-semibold animate-fade-in-down">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accounts are stored securely in the cloud, so you can sign in from any device. The first
          account created becomes the administrator.
        </p>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
