import { Pencil } from "lucide-react";
import { useState, type SubmitEvent } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditProposalMutation } from "@/store/proposals-api";
import type { Proposal } from "@/types/proposal";
import { hourlyRate } from "@/utils/candidate-format";


// The BU Head changes the hourly bill rate before sending the proposal to the MD.
export function EditRateDialog({ proposal }: { proposal: Proposal }) {
    const [open, setOpen] = useState(false);
    const [rate, setRate] = useState("");
    const [currency, setCurrency] = useState("");
    const [editProposal, { isLoading, error }] = useEditProposalMutation();
  
    // Start from the current rate every time the dialog opens.
    function handleOpenChange(nextOpen: boolean) {
      if (nextOpen) {
        setRate(proposal.bill_rate_hourly != null ? String(proposal.bill_rate_hourly) : "");
        setCurrency(proposal.bill_rate_currency ?? "USD");
      }
      setOpen(nextOpen);
    }
  
    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
      try {
        await editProposal({
          proposal_id: proposal.id,
          bill_rate_hourly: Number(rate),
          bill_rate_currency: currency,
        }).unwrap();
        setOpen(false);
      } catch {
        // Keep the dialog open; the message shows from `error`.
      }
    }

return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Edit bill rate" title="Edit bill rate">
              <Pencil className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit bill rate</DialogTitle>
              <DialogDescription>
                {proposal.candidate.name ?? "Candidate"} → {proposal.client.name ?? "client"} · now{" "}
                {hourlyRate(proposal.bill_rate_hourly, proposal.bill_rate_currency)}
              </DialogDescription>
            </DialogHeader>
    
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-[1fr_6rem] gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`rate-${proposal.id}`}>Bill rate per hour</Label>
                  <Input
                    id={`rate-${proposal.id}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`currency-${proposal.id}`}>Currency</Label>
                  <Input
                    id={`currency-${proposal.id}`}
                    maxLength={3}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>
    
              <p className="text-xs text-muted-foreground">
                The change is recorded in the proposal's history, so the MD can see the old and new rate.
              </p>
    
              {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving…" : "Save rate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
}