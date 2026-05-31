import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-10 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-3 pe-9 text-sm text-foreground outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#1a1530] [&>option]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-muted-foreground" />
  </div>
));
Select.displayName = "Select";
