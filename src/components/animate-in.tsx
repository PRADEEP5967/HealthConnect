import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnimationVariant = "fade-in" | "fade-in-up" | "fade-in-down" | "scale-in";

export function AnimateIn({
  children,
  variant = "fade-in-up",
  delay = 0,
  className,
}: {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.animationDelay = `${delay}ms`;
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(`animate-${variant}`, className)}
    >
      {children}
    </div>
  );
}
