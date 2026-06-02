import { cn } from "@/lib/utils";

/**
 * Heart to Heart Logo: قلب أحمر يرمز للاتصال والتقارب
 * ألوان العلامة: أحمر H2H (#B31B3D) مع تدرجات دافئة
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="Heart to Heart"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="h2hGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B31B3D" />
          <stop offset="50%" stopColor="#D64066" />
          <stop offset="100%" stopColor="#8BB8C8" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* خلفية دائرية */}
      <circle cx="20" cy="20" r="18" fill="url(#h2hGradient)" opacity="0.15" />
      {/* القلب الرئيسي */}
      <path
        d="M20 32.5L18.2 30.8C12.5 25.5 9 21.8 9 17.5C9 14 11.5 11.2 15 11.2C17 11.2 19 12.2 20 14C21 12.2 23 11.2 25 11.2C28.5 11.2 31 14 31 17.5C31 21.8 27.5 25.5 21.8 30.8L20 32.5Z"
        fill="#B31B3D"
        stroke="#B31B3D"
        strokeWidth="0.5"
      />
      {/* لمعة القلب */}
      <ellipse cx="16" cy="16" rx="3" ry="2" fill="white" opacity="0.4" transform="rotate(-30 16 16)" />
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
          Heart <span className="text-primary">to</span> Heart
        </span>
        {showTagline && (
          <span className={cn("mt-0.5 text-[11px]", inverted ? "text-white/70" : "text-muted-foreground")}>
            Evenue Platform — منصة إدارة الفعاليات
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Evenue Logo المدمج مع H2H - للاستخدام المشترك
 */
export function EvenueLogo({
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
            by Heart to Heart Consulting
          </span>
        )}
      </div>
    </div>
  );
}
