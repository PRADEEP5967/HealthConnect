import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, HeartPulse, Calendar, Pill, FileText, Bell, BookOpen, ChartBar as BarChart3, Settings, ClipboardList, DatabaseBackup, LogOut, ShieldCheck, ShieldAlert } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";

const groups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Manage",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Health monitoring", url: "/admin/health-monitoring", icon: HeartPulse },
      { title: "Appointments", url: "/admin/appointments", icon: Calendar },
      { title: "Medications", url: "/admin/medications", icon: Pill },
      { title: "Medical records", url: "/admin/medical-records", icon: FileText },
      { title: "Emergency", url: "/admin/emergency", icon: ShieldAlert },
    ],
  },
  {
    label: "Platform",
    items: [
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
      { title: "Content", url: "/admin/content", icon: BookOpen },
      { title: "Reports", url: "/admin/reports", icon: BarChart3 },
      { title: "Activity logs", url: "/admin/activity-logs", icon: ClipboardList },
      { title: "Backup", url: "/admin/backup", icon: DatabaseBackup },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => pathname === p;
  const { logout, user } = useAuth();
  const nav = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">MediPulse</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((it) => (
                  <SidebarMenuItem key={it.title}>
                    <SidebarMenuButton asChild isActive={isActive(it.url)} tooltip={it.title}>
                      <Link to={it.url} className="flex items-center gap-2">
                        <it.icon className="h-4 w-4" />
                        {!collapsed && <span>{it.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-sidebar-foreground/70">
          {!collapsed && user && <div className="mb-2 truncate">Signed in as {user.name}</div>}
          <button
            onClick={() => {
              logout();
              nav({ to: "/" });
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
