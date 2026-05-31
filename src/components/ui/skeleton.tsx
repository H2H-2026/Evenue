import { cn } from "@/lib/utils";

/** شريط shimmer أساسي */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/[0.06]",
        className,
      )}
    />
  );
}

/** بطاقة إحصائية skeleton */
export function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
    </div>
  );
}

/** صف جدول skeleton */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className={cn("h-4", i === 0 ? "w-32" : "w-20")} />
        </td>
      ))}
    </tr>
  );
}

/** جدول كامل skeleton */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-5 py-3">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** بطاقة skeleton */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/** شبكة بطاقات skeleton */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
