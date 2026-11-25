import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAGE_SIZES, type PageSize } from "@/hooks/use-pagination";

interface TablePaginationProps {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  setPage: (page: number) => void;
  pageSize: PageSize;
  setPageSize: (size: PageSize) => void;
}

// The numbers to show: the first, the last, and those around the current page. "gap" is drawn as "…".
// Page 6 of 20 -> 1 … 5 6 7 … 20
function pageNumbers(page: number, pageCount: number): (number | "gap")[] {
  const result: (number | "gap")[] = [];
  let previous = 0;
  for (let number = 1; number <= pageCount; number++) {
    const wanted = number === 1 || number === pageCount || Math.abs(number - page) <= 1;
    if (!wanted) continue;
    if (number - previous === 2) result.push(number - 1); // one missing page: show it, "…" would not be shorter
    if (number - previous > 2) result.push("gap");
    result.push(number);
    previous = number;
  }
  return result;
}

// Under a table: how many rows to show, "1–10 of 37", and the page numbers. Nothing to show for an empty list.
export function TablePagination({ page, pageCount, from, to, total, setPage, pageSize, setPageSize }: TablePaginationProps) {
  if (total === 0) return null;
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Table pages">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Show
        <Select
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(PAGE_SIZES.find((size) => String(size) === value) ?? 10)}
        >
          <SelectTrigger className="h-8 w-20" aria-label="Records per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size === "all" ? "ALL" : size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          {from}–{to} of {total}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Previous page"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {pageNumbers(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? "default" : "ghost"}
              size="sm"
              className="h-8 min-w-8 px-2"
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => setPage(item)}
            >
              {item}
            </Button>
          ),
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Next page"
          onClick={() => setPage(page + 1)}
          disabled={page === pageCount}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
