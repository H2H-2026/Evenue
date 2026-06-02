import { cn } from "@/lib/utils";

/**
 * Evenue Logo: دمج بين Event + Avenue (المقر).
 * الرمز = دبوس موقع باللون النبتي (Mint Green #7CC4A4)
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="Evenue"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="evenueGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7CC4A4" />
          <stop offset="55%" stopColor="#5BA882" />
          <stop offset="100%" stopColor="#4A9068" />
        </linearGradient>
      </defs>
      {/* الدبوس */}
      <path
        d="M20 3C12.8 3 7 8.6 7 15.6C7 24.5 18.2 35.5 19.2 36.4a1.1 1.1 0 0 0 1.6 0C21.8 35.5 33 24.5 33 15.6C33 8.6 27.2 3 20 3Z"
        fill="url(#evenueGradient)"
      />
      {/* الجادة (avenue) المتقاربة نحو الأعلى */}
      <path d="M15.6 25.2 L24.4 25.2 L21.6 14.4 L18.4 14.4 Z" fill="#FFFFFF" opacity="0.95" />
      {/* علامات المسار */}
      <rect x="19.3" y="16.6" width="1.4" height="2.2" rx="0.7" fill="url(#evenueGradient)" />
      <rect x="19.3" y="20.2" width="1.4" height="2.6" rx="0.7" fill="url(#evenueGradient)" />
      {/* نقطة الفعالية / الوجهة */}
      <circle cx="20" cy="11.4" r="2.6" fill="#FFFFFF" />
      <circle cx="20" cy="11.4" r="1.2" fill="url(#evenueGradient)" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showTagline = false,
  inverted = false,
}: {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={cn("h-9 w-9", markClassName)} />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "text-xl font-extrabold tracking-tight",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          Even<span className="text-primary">ue</span>
        </span>
        {showTagline && (
          <span className={cn("mt-0.5 text-[11px]", inverted ? "text-white/70" : "text-muted-foreground")}>
            منصة الفعاليات والمقرّات
          </span>
        )}
      </div>
    </div>
  );
}
