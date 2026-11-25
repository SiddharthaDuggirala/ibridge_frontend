import { useState, type SubmitEvent } from "react";

import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMoveExitMutation } from "@/store/onboarding-api";
import { toIsoDate } from "@/utils/dates";

interface ChangeLastDayDialogProps {
  onboardingId: number;
  lastDay: string; // the current one, "dd/mm/YYYY"
}

// The Lead corrects the last working day (only offered while Django still allows it).
export function ChangeLastDayDialog({ onboardingId, lastDay }: ChangeLastDayDialogProps) {
  const [open, setOpen] = useState(false);
  const [newDay, setNewDay] = useState(""); // "YYYY-MM-DD"
  const [moveExit, { isLoading, error, reset }] = useMoveExitMutation();
  const currentDay = toIsoDate(lastDay);

  // Start from the current date every time the dialog opens.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setNewDay(currentDay);
      reset();
    }
    setOpen(nextOpen);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await moveExit({ onboarding_id: onboardingId, action: "change_last_day", last_working_day: newDay }).unwrap();
      setOpen(false);
    } catch {
      // Keep the dialog open; Django's message shows from `error`.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Change last day
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change last working day</DialogTitle>
          <DialogDescription>Now {lastDay}. The change is recorded in the history.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`last-day-${onboardingId}`}>Last working day</Label>
            <DatePicker id={`last-day-${onboardingId}`} value={newDay} onChange={setNewDay} />
          </div>

          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !newDay || newDay === currentDay}>
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}