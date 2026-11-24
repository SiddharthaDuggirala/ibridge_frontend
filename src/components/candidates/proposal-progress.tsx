import { format } from "date-fns";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProposalHistoryEntry } from "@/types/proposal";
import { daysSince, parseDjangoDateTime } from "@/utils/dates";

// The recruitment journey, in order. `key` is the Django stage at which the proposal waits on that step;
// `waiting` is the short text shown while it waits there.
const STEPS = [
  { key: "entered", label: "Entered", waiting: "entered" },
  { key: "lead", label: "Lead", waiting: "waiting for Lead" },
  { key: "bu_review", label: "BU Head", waiting: "with BU Head" },
  { key: "md_approval", label: "MD", waiting: "with MD" },
  { key: "hr_offer", label: "HR offer", waiting: "with HR" },
  { key: "offer_released", label: "Accepted", waiting: "waiting for the candidate's answer" },
  { key: "offer_accepted", label: "BGV started", waiting: "BGV to start" },
  { key: "bgv_initiated", label: "BGV result", waiting: "BGV in progress" },
  { key: "bgv_cleared", label: "Cleared", waiting: "cleared to join" },
];

// Stages where recruitment is complete (every step shows a tick), with what to say.
// "joined" means onboarding has taken over.
const COMPLETE: Record<string, string> = {
  bgv_cleared: "Cleared to join",
  joined: "Joined",
};

// Stages where the journey stops early: the step it stopped at, what to say, and the action that stopped it.
const ENDED: Record<string, { atStep: string; text: string; action: string }> = {
  offer_declined: { atStep: "offer_released", text: "Offer declined", action: "lead_offer_declined" },
  bgv_failed: { atStep: "bgv_initiated", text: "BGV failed", action: "lead_bgv_failed" },
};

// The history action that completes each step. After a send-back the latest one counts.
const DONE_BY: Record<string, string> = {
  lead: "proposed",
  bu_review: "bu_submit",
  md_approval: "md_approve",
  hr_offer: "hr_release_offer",
  offer_released: "lead_offer_accepted",
  offer_accepted: "lead_bgv_initiate",
  bgv_initiated: "lead_bgv_success",
  bgv_cleared: "lead_mark_joined",
};

// A step waiting this many days or more turns amber.
const SLOW_AFTER_DAYS = 3;

type StepState = "done" | "current" | "upcoming" | "ended";

// Which step is happening now (or where the journey stopped). No proposal yet (null) = waiting for the Lead.
function currentStepIndex(stage: string | null): number {
  if (!stage) return 1;
  if (stage in COMPLETE) return STEPS.length; // past the last step: every step is done
  const key = ENDED[stage]?.atStep ?? stage;
  const index = STEPS.findIndex((step) => step.key === key);
  return index === -1 ? 1 : index;
}

function stateOf(index: number, current: number, ended: boolean): StepState {
  if (index < current) return "done";
  if (index === current) return ended ? "ended" : "current";
  return "upcoming";
}

const DOT_STYLE: Record<StepState, string> = {
  done: "bg-primary text-primary-foreground",
  current: "bg-background text-primary ring-2 ring-primary",
  upcoming: "bg-muted text-muted-foreground",
  ended: "bg-destructive text-white",
};

// The small line under a step: who finished (or stopped) it and when, or how long the current step has waited.
function stepCaption(
  stepKey: string,
  state: StepState,
  stage: string | null,
  history: ProposalHistoryEntry[],
): { text: string; title: string; tone: "muted" | "slow" | "ended" } | null {
  if (state === "done" || state === "ended") {
    const action = state === "ended" && stage ? ENDED[stage].action : DONE_BY[stepKey];
    const entry = history.findLast((h) => h.action === action);
    const when = entry ? parseDjangoDateTime(entry.at) : null;
    if (!entry || !when) return null;
    return {
      text: `${entry.by} · ${format(when, "d MMM")}`,
      title: `${entry.by} · ${format(when, "d MMM yyyy, h:mm a")}${entry.comment ? ` · "${entry.comment}"` : ""}`,
      tone: state === "ended" ? "ended" : "muted",
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
      tone: days >= SLOW_AFTER_DAYS ? "slow" : "muted",
    };
  }
  return null;
}

const CAPTION_STYLE = {
  muted: "text-muted-foreground",
  slow: "font-medium text-amber-600",
  ended: "font-medium text-destructive",
};

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
  const ended = stage ? ENDED[stage] : undefined;
  // "Cleared to join" or "Joined" once recruitment is complete, otherwise undefined.
  const completeText = stage ? COMPLETE[stage] : undefined;
  const summary = !stage
    ? "Waiting for Lead"
    : ended
      ? `${label} · ${ended.text}`
      : completeText
        ? `${label} · ${completeText}`
        : `${label} · ${STEPS[current].waiting}`;
  const ariaLabel = ended
    ? `Recruitment progress: ended, ${ended.text}`
    : completeText
      ? `Recruitment progress: complete, ${completeText}`
      : `Recruitment progress: step ${current + 1} of ${STEPS.length}, ${STEPS[current].label}`;

  if (size === "compact") {
    return (
      <div className="flex items-center gap-2" title={summary}>
        <ol className="flex w-32 shrink-0 items-center" aria-label={ariaLabel}>
          {STEPS.map((step, index) => {
            const state = stateOf(index, current, Boolean(ended));
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
        <span className={cn("truncate text-xs", ended ? "text-destructive" : "text-muted-foreground")}>{summary}</span>
      </div>
    );
  }

  return (
    <ol className="flex w-full items-start" aria-label={ariaLabel}>
      {STEPS.map((step, index) => {
        const state = stateOf(index, current, Boolean(ended));
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
                caption?.tone === "slow" && "ring-amber-500 text-amber-600",
              )}
            >
              {state === "done" ? <Check className="size-4" /> : state === "ended" ? <X className="size-4" /> : index + 1}
              {state === "current" ? (
                <span
                  className={cn(
                    "absolute inset-0 animate-ping rounded-full ring-2",
                    caption?.tone === "slow" ? "ring-amber-500/50" : "ring-primary/40",
                  )}
                />
              ) : null}
            </span>
            <span
              className={cn(
                "text-center text-xs",
                state === "current" || state === "ended" ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {state === "ended" && ended
                ? ended.text
                : step.key === "bgv_cleared" && stage === "joined"
                  ? "Joined"
                  : step.label}
            </span>
            {caption ? (
              <span
                title={caption.title}
                className={cn("-mt-1 max-w-full truncate px-1 text-center text-[11px]", CAPTION_STYLE[caption.tone])}
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
