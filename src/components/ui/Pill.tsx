import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PillTone = "default" | "success" | "warning" | "info" | "muted";

const tones: Record<PillTone, string> = {
  default: "bg-muted text-foreground",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  info: "bg-secondary/10 text-secondary border border-secondary/20",
  muted: "bg-muted text-muted-foreground",
};

export function Pill({
  tone = "default",
  className,
  children,
}: {
  tone?: PillTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
