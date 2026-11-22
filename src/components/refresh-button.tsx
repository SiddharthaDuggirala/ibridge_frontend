import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Reloads a list from Django. Pass the query's `refetch` and `isFetching`.
export function RefreshButton({ onRefresh, isFetching }: { onRefresh: () => void; isFetching: boolean }) {
    return (
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={isFetching}>
        <RotateCw className={cn("size-4", isFetching && "animate-spin")} />
        {isFetching ? "Refreshing…" : "Refresh"}
      </Button>
    );
  }