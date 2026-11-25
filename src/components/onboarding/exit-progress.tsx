import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Exit } from "@/types/onboarding";
import { parseDjangoDateTime } from "@/utils/dates";


interface ExitStep {
    key: string;
    label: string;
    done: boolean;
    caption: string; // the small line under the step
  }
  
  // Has the last working day arrived? (Today counts.)
  function lastDayArrived(exit: Exit): boolean {
    const lastDay = parseDjangoDateTime(exit.last_working_day);
    return lastDay !== null && lastDay.getTime() <= Date.now();
  }
  
  // The steps come from Django's data: a resignation has its clearance items and a letter, other reasons don't.
  function exitSteps(exit: Exit): ExitStep[] {
    const arrived = lastDayArrived(exit);
    const recorded = { key: "recorded", label: "Exit recorded", done: true, caption: exit.reason_label };
    const lastDay = { key: "last_day", label: "Last working day", done: arrived, caption: exit.last_working_day };
    if (exit.reason !== "resigned") return [recorded, lastDay];
    return [
      recorded,
      ...exit.items.map((item) => ({
        key: item.key,
        label: item.label,
        done: item.done_on !== null,
        caption: item.done_on ? [item.by, item.done_on].filter(Boolean).join(" · ") : "Pending",
      })),
      lastDay,
      {
        key: "letter",
        label: "Relieving letter",
        done: exit.stage === "relieved",
        caption: exit.relieved_on ?? "Pending",
      },
    ];
  }
// One sentence for the whole exit, used in tables and by screen readers.
function exitSummary(exit: Exit): string {
    if (exit.stage === "relieved") return `Relieved on ${exit.relieved_on}`;
    if (exit.stage === "exited") return `${exit.reason_label} · last day ${exit.last_working_day}`;
    const left = exit.items.filter((item) => item.done_on === null).length;
    if (left > 0) return `${left} item${left === 1 ? "" : "s"} left · last day ${exit.last_working_day}`;
    return lastDayArrived(exit) ? "Ready for the relieving letter" : `Cleared · letter from ${exit.last_working_day}`;
  }
  
  // How an employee's exit is going: compact dots for tables, labelled circles for the candidate page.
  export function ExitProgress({ exit, size = "full" }: { exit: Exit; size?: "compact" | "full" }) {
    const steps = exitSteps(exit);
    const summary = exitSummary(exit);
  
    if (size === "compact") {
      return (
        <div className="flex items-center gap-2" title={summary}>
          <ol className="flex shrink-0 items-center gap-1" aria-label={`Exit: ${summary}`}>
            {steps.map((step) => (
              <li key={step.key} className={cn("size-2.5 rounded-full", step.done ? "bg-primary" : "bg-muted-foreground/30")} />
            ))}
          </ol>
          <span className="text-xs text-muted-foreground">{summary}</span>
        </div>
      );
    }
  
    return (
      <ol
        className={cn("flex w-full items-start", steps.length > 2 ? "max-w-3xl" : "max-w-xs")}
        aria-label={`Exit: ${summary}`}
      >
        {steps.map((step, index) => (
          <li key={step.key} className="relative flex flex-1 flex-col items-center gap-2 px-1 text-center">
            {index < steps.length - 1 ? (
              <span
                className={cn(
                  "absolute left-1/2 top-4 h-0.5 w-full",
                  step.done && steps[index + 1].done ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                step.done ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground ring-1 ring-muted-foreground/40",
              )}
            >
              {step.done ? <Check className="size-4" /> : index + 1}
            </span>
            <span className={cn("text-xs", step.done ? "font-medium" : "text-muted-foreground")}>{step.label}</span>
            <span className="-mt-1 text-[11px] text-muted-foreground">{step.caption}</span>
          </li>
        ))}
      </ol>
    );
  }