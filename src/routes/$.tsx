import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export const Route = createFileRoute("/$")({
  component: NotFound,
  head: () => ({
    meta: [
      { title: "Page not found — MediPulse" },
      { name: "description", content: "The page you were looking for doesn't exist on MediPulse." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
