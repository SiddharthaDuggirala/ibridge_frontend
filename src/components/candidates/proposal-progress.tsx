import {format} from "date-fns";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type {ProposalHistoryEntry} from '@/types/proposal';
 import { daysSince, parseDjangoDateTime } from "@/utils/dates";

const STEPS = [
    { key: "entered", label: "Entered" },
    { key: "lead", label: "Lead" },
    { key: "bu_review", label: "BU Head" },
    { key: "md_approval", label: "MD" },
    { key: "hr_offer", label: "HR offer" },
    {key:"offer_released", label: "Offer released"}
  ];

const FINAL_STAGE = "offer_released" 


const DONE_BY: Record<string,string>={
  lead: "proposed",
  bu_review: "bu_submit",
  md_approval: "md_approve",
  offer_released: "hr_release_offer",
}

// A step waiting this many days or more turns amber.
const SLOW_AFTER_DAYS = 3;

type StepState = "done" | "current" | "upcoming";



function currentStepIndex(stage: string | null): number {
    if (!stage) return 1;
    if (stage === FINAL_STAGE) return STEPS.length;
    const index = STEPS.findIndex((step) => step.key === stage);
    return index === -1 ? 1 : index;
  }

function stateOf(index: number, current: number): StepState {
    if (index < current) return "done";
    if (index === current) return "current";
    return "upcoming";
  }
  
const DOT_STYLE: Record<StepState, string> = {
    done: "bg-primary text-primary-foreground",
    current: "bg-background text-primary ring-2 ring-primary",
    upcoming: "bg-muted text-muted-foreground",
};


function stepCaption(
  stepKey:string,
  state:StepState,
  stage: string | null,
  history: ProposalHistoryEntry[],
): {text:string; title:string, slow:boolean} | null {
  if (state === "done"){
    const entry = history.findLast((h) => h.action === DONE_BY[stepKey]);
    const when = entry ? parseDjangoDateTime(entry.at) : null;
    if(!entry || !when) return null;
    return {
      text: `${entry.by} · ${format(when, "d MMM")}`,
      title: `${entry.by} · ${format(when, "d MMM yyyy, h:mm a")}${entry.comment ? ` · "${entry.comment}"` : ""}`,
      slow: false,
    };
  }
  
  if (state === "current" && stage) {
    // When the proposal arrived at this stage: the latest history line that moved it here.
    const arrived = history.findLast((h) => h.to_stage === stage);
    const when = arrived ? parseDjangoDateTime(arrived.at) : null;
    if (!when) return null;
    const days = daysSince(when);
    return {
      text: days === 0 ? "Since today" : `${days} day${days === 1 ? "" : "s"} waiting`,
      title: `Waiting since ${format(when, "d MMM yyyy, h:mm a")}`,
      slow: days >= SLOW_AFTER_DAYS,
    };
  } 

  return null;
}

// stage: the proposal's stage, or null when the candidate has no proposal yet.
// label: the client's name (ignored when stage is null).
// size: "compact" for table rows, "full" for the detail page.
// history: the proposal's history (optional); adds who/when under each finished step and the waiting time.
export function ProposalProgress({
  stage,
  label,
  size = "full",
  history = [],
}: {
  stage: string | null;
  label: string;
  size?: "compact" | "full";
  history?: ProposalHistoryEntry[];
}) {
  const current = currentStepIndex(stage);
  const complete = current >= STEPS.length;
  const summary = !stage
    ? "Waiting for Lead"
    : complete
      ? `${label} · Offer released`
      : `${label} · with ${STEPS[current].label}`;
  const ariaLabel = complete
    ? "Approval progress: complete, offer released"
    : `Approval progress: step ${current + 1} of ${STEPS.length}, ${STEPS[current].label}`;

  if (size === "compact") {
    return (
      <div className="flex items-center gap-2" title={summary}>
        <ol className="flex w-24 shrink-0 items-center" aria-label={ariaLabel}>
          {STEPS.map((step, index) => {
            const state = stateOf(index, current);
            return (
              <li key={step.key} className="flex flex-1 items-center last:flex-none">
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    DOT_STYLE[state],
                    state === "current" && "animate-pulse",
                  )}
                />
                {index < STEPS.length - 1 ? (
                  <span className={cn("h-0.5 flex-1", index < current ? "bg-primary" : "bg-border")} />
                ) : null}
              </li>
            );
          })}
        </ol>
        <span className="truncate text-xs text-muted-foreground">{summary}</span>
      </div>
    );
  }

  return (
    <ol className="flex w-full items-start" aria-label={ariaLabel}>
      {STEPS.map((step, index) => {
        const state = stateOf(index, current);
        const caption = stepCaption(step.key, state, stage, history);
        return (
          <li key={step.key} className="relative flex flex-1 flex-col items-center gap-2">
            {/* The line from this step's circle to the next one. */}
            {index < STEPS.length - 1 ? (
              <span
                className={cn(
                  "absolute left-1/2 top-4 h-0.5 w-full",
                  index < current ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                DOT_STYLE[state],
                caption?.slow && "ring-amber-500 text-amber-600",
              )}
            >
              {state === "done" ? <Check className="size-4" /> : index + 1}
              {state === "current" ? (
                <span
                  className={cn(
                    "absolute inset-0 animate-ping rounded-full ring-2",
                    caption?.slow ? "ring-amber-500/50" : "ring-primary/40",
                  )}
                />
              ) : null}
            </span>
            <span
              className={cn(
                "text-center text-xs",
                state === "current" ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            {caption ? (
              <span
                title={caption.title}
                className={cn(
                  "-mt-1 max-w-full truncate px-1 text-center text-[11px]",
                  caption.slow ? "font-medium text-amber-600" : "text-muted-foreground",
                )}
              >
                {caption.text}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}