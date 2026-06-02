import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types";

const STATUS_STYLES: Record<EventStatus, string> = {
  draft: "bg-white/10 text-muted-foreground",
  published: "bg-[#7CC4A4]/15 text-[#7CC4A4]",
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
      {status === "ongoing" && (
        <span className="me-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
      )}
      {label}
    </span>
  );
}
