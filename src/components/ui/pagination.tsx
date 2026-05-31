import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  if (totalPages <= 1) return null;

  // حساب أرقام الصفحات المعروضة
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className={cn("flex items-center justify-center gap-1 pt-4", className)}>
      <Button
        variant="ghost"
        size="icon"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="h-8 w-8"
      >
        {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "ghost"}
            size="icon"
            onClick={() => onPageChange(p)}
            className={cn("h-8 w-8 text-xs", p === page && "pointer-events-none")}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        size="icon"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="h-8 w-8"
      >
        {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}

/** Hook لحساب البيانات المقسّمة */
export function usePagination<T>(items: T[], perPage = 10) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  return { totalPages, perPage };
}
