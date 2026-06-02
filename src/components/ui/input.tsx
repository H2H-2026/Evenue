import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[#7CC4A4]/50 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
