import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join("");
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7CC4A4] to-[#5BA882] font-bold text-white shadow-glow-sm",
        className,
      )}
    >
      <span className="text-sm">{initials(name)}</span>
    </div>
  );
}
