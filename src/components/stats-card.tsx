import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="flex items-start justify-between gap-2 p-4 sm:gap-4 sm:p-5">
        <div className="min-w-0">
          <div className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</div>
          <div className="mt-1 break-words text-xl font-semibold tabular-nums sm:text-2xl">{value}</div>
          {hint && <div className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{hint}</div>}
        </div>
        <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-110 sm:h-10 sm:w-10", toneClass)}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 grid grid-cols-[minmax(0,1fr)] items-start gap-3 sm:mb-6 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
