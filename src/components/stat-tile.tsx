import type {ReactNode} from "react"; 
import {cn} from "@/lib/utils";

type Tone = "default" | "positive" | "warning" | "critical";

const toneClasses: Record<Tone, string> = {
    default: "text-foreground",
    positive: "text-primary",
    warning: "text-warning",
    critical: "text-destructive",
  };


export function StatTile({
    label,
    value,
    hint,
    tone = "default",
    icon,
  }: {
    label: string;
    value: string | number;
    hint?: string;
    tone?: Tone;
    icon?: ReactNode;
  }) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {icon ? <span className="text-muted-foreground">{icon}</span> : null}
        </div>
        <p className={cn("mt-2 text-2xl font-semibold tabular-nums", toneClasses[tone])}>{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    );
  }