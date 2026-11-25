import { useState } from "react";

// How many rows one page may hold. "all" = everything on one page.
export type PageSize = 10 | 50 | 100 | "all";
export const PAGE_SIZES: PageSize[] = [10, 50, 100, "all"];

// Cuts any list into pages. resetKey: whatever the list is filtered by; when it changes, we are back on page 1.
export function usePagination<T>(rows: T[], resetKey = "") {
  const [chosen, setChosen] = useState({ key: resetKey, page: 1 });
  const [pageSize, setPageSize] = useState<PageSize>(10);

  const size = pageSize === "all" ? Math.max(1, rows.length) : pageSize;
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  // A page chosen under another filter no longer counts; and a list that got shorter may have fewer pages now.
  const page = Math.min(chosen.key === resetKey ? chosen.page : 1, pageCount);
  const start = (page - 1) * size;

  return {
    pageRows: rows.slice(start, start + size),
    page,
    pageCount,
    from: rows.length === 0 ? 0 : start + 1,
    to: Math.min(start + size, rows.length),
    total: rows.length,
    setPage: (next: number) => setChosen({ key: resetKey, page: next }),
    pageSize,
    // Another page size starts again from the first page.
    setPageSize: (next: PageSize) => {
      setPageSize(next);
      setChosen({ key: resetKey, page: 1 });
    },
  };
}
