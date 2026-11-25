import { ChangeLastDayDialog } from "@/components/onboarding/change-last-day-dialog";
import { ExitConfirmButton } from "@/components/onboarding/exit-confirm-button";
import { ExitProgress } from "@/components/onboarding/exit-progress";
import type { Exit, Onboarding } from "@/types/onboarding";

// The exit of one employee: progress, and the buttons this user may press (Django decides, see exit_actions).
export function ExitPanel({ onboarding, exit }: { onboarding: Onboarding; exit: Exit }) {
  const name = onboarding.candidate.name ?? "this employee";
  const can = (action: string) => onboarding.exit_actions.includes(action);
  const pending = exit.items.filter((item) => item.done_on === null);

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exit</p>
      <ExitProgress exit={exit} />
      {exit.comment ? <p className="text-sm text-muted-foreground">“{exit.comment}”</p> : null}

      {onboarding.exit_actions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {can("clear_item")
            ? pending.map((item) => (
                <ExitConfirmButton
                  key={item.key}
                  label={item.label}
                  question={`Confirm for ${name}: ${item.label}.`}
                  request={{ onboarding_id: onboarding.id, action: "clear_item", item: item.key }}
                />
              ))
            : null}
          {can("release_relieving_letter") ? (
            <ExitConfirmButton
              label="Release relieving letter"
              question={`Mark the relieving letter of ${name} as released.`}
              request={{ onboarding_id: onboarding.id, action: "release_relieving_letter" }}
            />
          ) : null}
          {can("change_last_day") ? (
            <ChangeLastDayDialog onboardingId={onboarding.id} lastDay={exit.last_working_day} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}