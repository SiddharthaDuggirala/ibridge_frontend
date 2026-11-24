import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Onboarding } from "@/types/onboarding";
import { daysSince, parseDjangoDateTime } from "@/utils/dates";

// The onboarding journey. `key` is the Django stage at which the case waits on that step.
// Later steps (documents, IT accounts, payroll) are added here as new lines.
const STEPS = [
  { key: "start", label: "Joined" },
  { key: "joined", label: "Induction" },
];

// Stages where onboarding is complete, with what to say.
const COMPLETE: Record<string, string> = { inducted: "Onboarding complete" };

// An induction still waiting this many days after joining turns amber.
const SLOW_AFTER_DAYS = 3;

function currentStepIndex(stage: string): number {
  if (stage in COMPLETE) return STEPS.length;
  const index = STEPS.findIndex((step) => step.key === stage);
  return index === -1 ? 1 : index;
}

// The onboarding steps of one joiner: compact dots for tables, labelled circles with dates for the candidate page.
export function OnboardingProgress({ onboarding, size = "full" }: { onboarding: Onboarding; size?: "compact" | "full" }) {
  const current = currentStepIndex(onboarding.stage);
  const complete = onboarding.stage in COMPLETE;

  // Days since joining, while still waiting for the induction.
  const joined = onboarding.joining_date ? parseDjangoDateTime(onboarding.joining_date) : null;
  const waitingDays = !complete && joined ? daysSince(joined) : null;
  const slow = waitingDays !== null && waitingDays >= SLOW_AFTER_DAYS;
  const waitingText =
    waitingDays === 0 ? "Since today" : `${waitingDays} day${waitingDays === 1 ? "" : "s"} waiting`;

  const summary = complete
    ? `Inducted on ${onboarding.induction_date}`
    : `Waiting for induction${waitingDays ? ` · ${waitingDays} day${waitingDays === 1 ? "" : "s"}` : ""}`;

  // The date shown under each step.
  const stepDates: Record<string, string | null> = {
    start: onboarding.joining_date,
    joined: onboarding.induction_date,
  };

  if (size === "compact") {
    return (
      <div className="flex items-center gap-2" title={summary}>
        <ol className="flex w-10 shrink-0 items-center" aria-label={`Onboarding: ${summary}`}>
          {STEPS.map((step, index) => (
            <li key={step.key} className="flex flex-1 items-center last:flex-none">
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  index < current
                    ? "bg-primary"
                    : index === current
                      ? cn("animate-pulse ring-2", slow ? "bg-background ring-amber-500" : "bg-background ring-primary")
                      : "bg-muted",
                )}
              />
              {index < STEPS.length - 1 ? (
                <span className={cn("h-0.5 flex-1", index < current ? "bg-primary" : "bg-border")} />
              ) : null}
            </li>
          ))}
        </ol>
        <span className={cn("truncate text-xs", slow ? "font-medium text-amber-600" : "text-muted-foreground")}>
          {summary}
        </span>
      </div>
    );
  }

  return (
    <ol className="flex w-full max-w-md items-start" aria-label={`Onboarding: ${summary}`}>
      {STEPS.map((step, index) => {
        const done = index < current;
        const isCurrent = index === current;
        return (
          <li key={step.key} className="relative flex flex-1 flex-col items-center gap-2">
            {index < STEPS.length - 1 ? (
              <span className={cn("absolute left-1/2 top-4 h-0.5 w-full", done ? "bg-primary" : "bg-border")} />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                done
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                    ? cn("bg-background ring-2", slow ? "text-amber-600 ring-amber-500" : "text-primary ring-primary")
                    : "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <span className={cn("text-xs", isCurrent ? "font-semibold" : "text-muted-foreground")}>{step.label}</span>
            <span className={cn("-mt-1 text-[11px]", isCurrent && slow ? "font-medium text-amber-600" : "text-muted-foreground")}>
              {stepDates[step.key] ?? (isCurrent && waitingDays !== null ? waitingText : "")}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
