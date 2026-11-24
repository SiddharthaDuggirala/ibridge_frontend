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
import { Textarea } from "@/components/ui/textarea";
import { useMoveOnboardingMutation } from "@/store/onboarding-api";
import type { Onboarding } from "@/types/onboarding";

// HR records the induction session for a joiner.
export function InductionDialog({ onboarding }: { onboarding: Onboarding }) {
  const [open, setOpen] = useState(false);
  const [inductionDate, setInductionDate] = useState(""); // "YYYY-MM-DD"
  const [comment, setComment] = useState("");
  const [moveOnboarding, { isLoading, error, reset }] = useMoveOnboardingMutation();

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setInductionDate("");
      setComment("");
      reset();
    }
    setOpen(nextOpen);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await moveOnboarding({
        onboarding_id: onboarding.id,
        action: "hr_induction_done",
        induction_date: inductionDate,
        comment,
      }).unwrap();
      setOpen(false); // the list and the candidate's history refresh by themselves (tags)
    } catch {
      // Keep the dialog open; Django's message (e.g. "before the joining date") shows from `error`.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Induction done</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Induction done</DialogTitle>
          <DialogDescription>
            {onboarding.candidate.name ?? "Candidate"} · joined on {onboarding.joining_date ?? "—"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`induction-${onboarding.id}`}>Induction date</Label>
            <DatePicker id={`induction-${onboarding.id}`} value={inductionDate} onChange={setInductionDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`induction-comment-${onboarding.id}`}>Comment (optional)</Label>
            <Textarea id={`induction-comment-${onboarding.id}`} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>

          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !inductionDate}>
              {isLoading ? "Saving…" : "Induction done"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
