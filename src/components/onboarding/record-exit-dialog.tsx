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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMoveExitMutation } from "@/store/onboarding-api";
import type { AfterExit, ExitReason, Onboarding } from "@/types/onboarding";


// The reasons Django accepts. `note` tells the Lead what happens next.
const REASONS: { value: ExitReason; label: string; note: string }[] = [
    {
      value: "resigned",
      label: "Resigned",
      note: "Needs clearance: laptop, ID / access card and timesheets. HR then releases the relieving letter, on or after the last working day.",
    },
    { value: "project_completed", label: "Project completed", note: "Recorded straight away. No clearance is needed." },
    {
      value: "client_terminated",
      label: "Laid off by the client",
      note: "Recorded straight away. No clearance is needed.",
    },
    {
      value: "non_performance",
      label: "Non-performance",
      note: "Needs clearance and the relieving letter, like a resignation. New proposals are blocked until the sysadmin or MD allows them again.",
    },
  ];

// Non-performance only: what happens after the last working day.
const AFTER_EXIT: { value: AfterExit; label: string }[] = [
    { value: "leave", label: "Leaves the company" },
    { value: "bench", label: "Moves to the bench" },
  ];


  export function RecordExitDialog({ onboarding }: { onboarding: Onboarding }) {
    const [open, setOpen] = useState(false);
    // "" = nothing chosen yet, so the Lead has to pick a reason.
    const [reason, setReason] = useState<ExitReason | "">("");
    const [afterExit, setAfterExit] = useState<AfterExit | "">(""); // non-performance only
    const [lastDay, setLastDay] = useState(""); // "YYYY-MM-DD"
    const [comment, setComment] = useState("");
    const [moveExit, { isLoading, error, reset }] = useMoveExitMutation();
  
    const chosen = REASONS.find((item) => item.value === reason);
    const needsAfterExit = reason === "non_performance";
    const ready = reason !== "" && lastDay !== "" && (!needsAfterExit || afterExit !== "");

    function handleOpenChange(nextOpen: boolean) {
      if (nextOpen) {
        setReason("");
        setAfterExit("");
        setLastDay("");
        setComment("");
        reset();
      }
      setOpen(nextOpen);
    }
  
    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
      if (reason === "") return; // the button is disabled too; this tells TypeScript reason is a real ExitReason below
      try {
        await moveExit({
          onboarding_id: onboarding.id,
          action: "record_exit",
          reason,
          // Only sent for non-performance; `undefined` leaves the field out of the request.
          after_exit: needsAfterExit && afterExit !== "" ? afterExit : undefined,
          last_working_day: lastDay,
          comment,
        }).unwrap();
        setOpen(false); // the lists and the candidate page refresh by themselves (tags)
      } catch {
        // Keep the dialog open; Django's message (e.g. "before the joining date") shows from `error`.
      }
}
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              Record exit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record exit</DialogTitle>
              <DialogDescription>
                {onboarding.candidate.name ?? "Candidate"} · {onboarding.client.name ?? "client"} · joined on{" "}
                {onboarding.joining_date ?? "—"}
              </DialogDescription>
            </DialogHeader>
    
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`exit-reason-${onboarding.id}`}>Reason</Label>
                <Select value={reason} onValueChange={(value) => setReason(value as ExitReason)}>
                  <SelectTrigger id={`exit-reason-${onboarding.id}`} className="w-full">
                    <SelectValue placeholder="Why is the employee leaving?" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {chosen ? <p className="text-xs text-muted-foreground">{chosen.note}</p> : null}
              </div>
              {needsAfterExit ? (
                <div className="space-y-2">
                  <Label htmlFor={`exit-after-${onboarding.id}`}>After the last working day</Label>
                  <Select value={afterExit} onValueChange={(value) => setAfterExit(value as AfterExit)}>
                    <SelectTrigger id={`exit-after-${onboarding.id}`} className="w-full">
                      <SelectValue placeholder="Leaves the company or moves to the bench?" />
                    </SelectTrigger>
                    <SelectContent>
                      {AFTER_EXIT.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor={`exit-day-${onboarding.id}`}>Last working day</Label>
                <DatePicker id={`exit-day-${onboarding.id}`} value={lastDay} onChange={setLastDay} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`exit-comment-${onboarding.id}`}>Comment (optional)</Label>
                <Textarea id={`exit-comment-${onboarding.id}`} value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>
    
              {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !ready}>
                  {isLoading ? "Saving…" : "Record exit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    }