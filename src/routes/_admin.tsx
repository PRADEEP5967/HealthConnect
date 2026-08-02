import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Printer } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Separator } from "@/components/ui/separator";
import { ShortcutsHelp } from "@/components/shortcuts-help";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const { user, ready } = useAuth();
  const nav = useNavigate();
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!ready) return;
    if (!user) nav({ to: "/login" });
    else if (user.role !== "ADMIN") nav({ to: "/dashboard" });
  }, [ready, user, nav]);

  // Keep the admin view in sync with accounts and activity created on other devices.
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    void syncDirectory();
    const t = setInterval(() => void syncDirectory(), 20000);
    const onFocus = () => void syncDirectory();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [user]);


  useKeyboardShortcuts([
    { key: "d", description: "Dashboard", handler: () => nav({ to: "/admin/dashboard" }) },
    { key: "u", description: "Users", handler: () => nav({ to: "/admin/users" }) },
    { key: "a", description: "Appointments", handler: () => nav({ to: "/admin/appointments" }) },
    { key: "m", description: "Medications", handler: () => nav({ to: "/admin/medications" }) },
    { key: "n", description: "Notifications", handler: () => nav({ to: "/admin/notifications" }) },
    { key: "r", description: "Reports", handler: () => nav({ to: "/admin/reports" }) },
    { key: "s", description: "Settings", handler: () => nav({ to: "/admin/settings" }) },
    { key: "t", description: "Toggle theme", handler: toggle },
  ]);

  if (!ready || !user) return null;

  const parts = pathname.split("/").filter(Boolean);
  const label = parts[1] ? parts[1].replace(/-/g, " ") : "dashboard";

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="no-print sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card/80 px-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
              <span className="text-xs text-muted-foreground">Admin</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-sm font-medium capitalize">{label}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShortcutsHelp
                shortcuts={[
                  { key: "d", description: "Admin dashboard" },
                  { key: "u", description: "Users" },
                  { key: "a", description: "Appointments" },
                  { key: "m", description: "Medications" },
                  { key: "n", description: "Notifications" },
                  { key: "r", description: "Reports" },
                  { key: "s", description: "Settings" },
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
