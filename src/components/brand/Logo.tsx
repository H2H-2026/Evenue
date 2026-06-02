import { cn } from "@/lib/utils";

/**
 * Heart to Heart / Evenue Logo component
 * Renders H2H branding logos with custom SVG heart badge as fallback
 */
export function LogoMark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Primary PNG Logo */}
      <img
        src={inverted ? "/Final-Logo-White.png" : "/h2h-logo1.png"}
        alt="Heart to Heart Logo"
        className="h-full w-full object-contain"
        onError={(e) => {
          // If PNG fails, hide image and let fallback show
          e.currentTarget.style.display = "none";
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "block";
        }}
      />
      
      {/* SVG Fallback (Heart Circle Gradient) */}
      <svg
        viewBox="0 0 40 40"
        className="absolute inset-0 h-full w-full hidden"
        role="img"
        aria-label="Heart to Heart Fallback"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="h2hGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B31B3D" />
            <stop offset="100%" stopColor="#8BB8C8" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill={inverted ? "none" : "url(#h2hGrad)"} stroke={inverted ? "#FFFFFF" : "none"} strokeWidth={inverted ? 2.5 : 0} />
        <path
          d="M12 16 C12 11, 19 11, 20 15 C21 11, 28 11, 28 16 C28 23, 20 28, 20 28 C20 28, 12 23, 12 16 Z"
          fill={inverted ? "#FFFFFF" : "#FFFFFF"}
        />
      </svg>
    </div>
  );
}

export function Logo({
  className,
  markClassName,
  showTagline = false,
  showHeartToHeart = false,
  inverted = false,
}: {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
  showHeartToHeart?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={cn("h-9 w-9", markClassName)} inverted={inverted} />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "text-xl md:text-2xl font-extrabold tracking-tight",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          Even<span className="text-primary">ue</span>
        </span>
        {showTagline && (
          <span className={cn("mt-1 text-xs", inverted ? "text-white/70" : "text-muted-foreground")}>
            منصة الفعاليات والمقرّات
          </span>
        )}
        {showHeartToHeart && (
          <span className={cn("mt-1 text-[11px] font-medium", inverted ? "text-white/60" : "text-muted-foreground")}>
            by Heart to Heart Consulting
          </span>
        )}
      </div>
    </div>
  );
}
