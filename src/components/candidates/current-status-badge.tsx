import { Badge } from "@/components/ui/badge";
import type { CurrentStatus, StatusKey } from "@/types/lifecycle";
import { cn } from "@/lib/utils";

// One colour per status. Record<StatusKey, ...> means TypeScript complains if a status is missing here.
const STATUS_STYLE: Record<StatusKey, string> = {
    available: "border-border bg-background text-foreground",
    in_process: "border-blue-200 bg-blue-50 text-blue-800",
    working: "border-emerald-200 bg-emerald-50 text-emerald-800",
    leaving: "border-orange-200 bg-orange-50 text-orange-800",
    bench: "border-amber-300 bg-amber-100 text-amber-900",
    left: "border-border bg-muted text-muted-foreground",
  };

// Where a candidate is now, e.g. "Working at Globex" or "On bench · 13 days".
export function CurrentStatusBadge({ status }: { status: CurrentStatus }) {
    const days =  status.key === "bench" && status.days !== null ? ` · ${status.days} day${status.days === 1 ? "" : "s"}` : "";
    return (
      <Badge
        variant="outline"
        className={cn("whitespace-nowrap", STATUS_STYLE[status.key])}
        title={status.since ? `Since ${status.since}` : undefined}
      >
        {status.label}
        {days}
      </Badge>
    );
  }