import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Calendar, HeartPulse, Pill, ShieldCheck, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "MediPulse — Personal Health Monitoring" },
      {
        name: "description",
        content:
          "Track vitals, medications, and appointments. A calm, local-first health dashboard for patients and admins.",
      },
      { property: "og:title", content: "MediPulse — Personal Health Monitoring" },
      { property: "og:description", content: "Patient and admin tools for wellness tracking, offline-ready." },
    ],
  }),
});

const features = [
  { icon: HeartPulse, title: "Vitals tracking", body: "Blood pressure, sugar, weight, heart rate." },
  { icon: Pill, title: "Medication reminders", body: "Never miss a dose with daily schedules." },
  { icon: Calendar, title: "Appointments", body: "Plan visits and follow-ups in one place." },
  { icon: LineChart, title: "Trends & analytics", body: "Beautiful charts of your health story." },
  { icon: ShieldCheck, title: "Local-first", body: "Data stays on your device. No account required." },
  { icon: Activity, title: "Admin dashboard", body: "Full system controls for care coordinators." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="h-4 w-4" />
            </span>
            MediPulse
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Local-first health platform
        </span>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          A calm dashboard for your <span className="text-primary">whole health picture</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-muted-foreground sm:text-lg">
          MediPulse helps patients log vitals, track medications, and prepare for visits — while admins
          get a bird's-eye view of the community they care for.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/register">Create your account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Sign in as patient or admin</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Demo admin: <b>admin@demo.local</b> / <b>admin123</b> · Demo patient: <b>sara@demo.local</b> / <b>user123</b>
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MediPulse. Demo application — data stored locally in your browser.
      </footer>
    </div>
  );
}
