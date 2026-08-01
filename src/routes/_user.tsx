import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user-sidebar";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Printer } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Separator } from "@/components/ui/separator";
import { ShortcutsHelp } from "@/components/shortcuts-help";
import { UserNotifications } from "@/components/user-notifications";

export const Route = createFileRoute("/_user")({
  ssr: false,
  component: UserLayout,
});

const navMap: Record<string, string> = {
  d: "/dashboard",
  h: "/health",
  m: "/medicine",
  a: "/appointments",
  r: "/records",
  f: "/fitness",
  n: "/nutrition",
  s: "/sleep",
  e: "/emergency",
  p: "/profile",
};

function UserLayout() {
  const { user, ready } = useAuth();
  const nav = useNavigate();
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!ready) return;
    if (!user) nav({ to: "/login" });
    else if (user.role !== "USER") nav({ to: "/admin/dashboard" });
  }, [ready, user, nav]);

  useKeyboardShortcuts([
    { key: "d", description: "Dashboard", handler: () => nav({ to: "/dashboard" }) },
    { key: "h", description: "Health", handler: () => nav({ to: "/health" }) },
    { key: "m", description: "Medications", handler: () => nav({ to: "/medicine" }) },
    { key: "a", description: "Appointments", handler: () => nav({ to: "/appointments" }) },
    { key: "r", description: "Records", handler: () => nav({ to: "/records" }) },
    { key: "f", description: "Fitness", handler: () => nav({ to: "/fitness" }) },
    { key: "n", description: "Nutrition", handler: () => nav({ to: "/nutrition" }) },
    { key: "s", description: "Sleep", handler: () => nav({ to: "/sleep" }) },
    { key: "e", description: "Emergency", handler: () => nav({ to: "/emergency" }) },
    { key: "p", description: "Profile", handler: () => nav({ to: "/profile" }) },
    { key: ",", description: "Settings", handler: () => nav({ to: "/settings" }) },
    { key: "t", description: "Toggle theme", handler: toggle },
  ]);

  if (!ready || !user) return null;

  const pageName = pathname.split("/").pop() || "dashboard";
  const label = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="min-h-screen flex w-full bg-background">
        <UserSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="no-print sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card/80 px-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm font-medium capitalize">{label}</span>
            </div>
            <div className="flex items-center gap-1">
              <UserNotifications />
              <ShortcutsHelp
                shortcuts={[
                  { key: "d", description: "Dashboard" },
                  { key: "h", description: "Health metrics" },
                  { key: "m", description: "Medications" },
                  { key: "a", description: "Appointments" },
                  { key: "r", description: "Medical records" },
                  { key: "f", description: "Fitness" },
                  { key: "n", description: "Nutrition" },
                  { key: "s", description: "Sleep" },
                  { key: "e", description: "Emergency" },
                  { key: "p", description: "Profile" },
                  { key: "t", description: "Toggle dark/light theme" },
                ]}
              />
              <Button variant="ghost" size="icon" onClick={() => window.print()} aria-label="Print page">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>
          <main id="main-content" className="flex-1 p-4 sm:p-6">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
