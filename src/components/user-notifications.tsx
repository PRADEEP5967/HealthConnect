import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notifications } from "@/lib/storage";
import { useLive } from "@/lib/useLive";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function UserNotifications() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const [open, setOpen] = useState(false);
  const items = useLive(() => (uid ? Notifications.forUser(uid) : []), [], [uid]);
  const unread = items.filter((n) => !n.read?.[uid]).length;

  const markAllRead = () => {
    items.forEach((n) => {
      if (!n.read?.[uid]) Notifications.markRead(n.id, uid);
    });
    toast.success("All marked as read");
  };

  const markOneRead = (id: string) => {
    Notifications.markRead(id, uid);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && <Badge variant="secondary">{unread} new</Badge>}
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          <div className="divide-y">
            {items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            )}
            {items.map((n) => {
              const isUnread = !n.read?.[uid];
              return (
                <button
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      isUnread ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm ${isUnread ? "font-medium" : ""}`}>
                      {n.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {n.body}
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
