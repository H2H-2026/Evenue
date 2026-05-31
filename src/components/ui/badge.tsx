import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types";

const STATUS_STYLES: Record<EventStatus, string> = {
  draft: "bg-white/10 text-muted-foreground",
  published: "bg-violet-500/15 text-violet-300",
  ongoing: "bg-emerald-500/15 text-emerald-300",
  completed: "bg-sky-500/15 text-sky-300",
  cancelled: "bg-red-500/15 text-red-300",
};

export function StatusBadge({ status, label }: { status: EventStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {label}
    </span>
  );
}
