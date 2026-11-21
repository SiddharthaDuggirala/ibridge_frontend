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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMoveProposalMutation } from "@/store/proposals-api";
import type { Proposal } from "@/types/proposal";


const ACTIONS: Record<
  string,
  { label: string; title: string; commentRequired: boolean; variant: "default" | "outline" }
> = {
  bu_submit: { label: "Send to MD", title: "Send to the MD for approval", commentRequired: false, variant: "default" },
  md_approve: { label: "Approve", title: "Approve this proposal", commentRequired: false, variant: "default" },
  md_send_back: { label: "Send back", title: "Send back to the BU Head", commentRequired: true, variant: "outline" },
};

// One button + confirm dialog for one approval step (e.g. "Send to MD").
export function ProposalActionDialog({ proposal, action }: { proposal: Proposal; action: string }) {
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState("");
    const [moveProposal, { isLoading, error }] = useMoveProposalMutation();
  
    const config = ACTIONS[action];
    if (!config) return null; // an action Django knows but this screen does not (yet)
  
    function handleOpenChange(nextOpen: boolean) {
      if (nextOpen) setComment("");
      setOpen(nextOpen);
    }
  
    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
      try {
        await moveProposal({ proposal_id: proposal.id, action, comment }).unwrap();
        setOpen(false); // the lists and progress bars refresh by themselves (tags)
      } catch {
        // Keep the dialog open; the message shows from `error`.
      }
    }
  
    const who = `${proposal.candidate.name ?? "Candidate"} → ${proposal.client.name ?? "client"}`;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant={config.variant} size="sm">
              {config.label}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{who}</DialogDescription>
            </DialogHeader>
    
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`comment-${proposal.id}-${action}`}>
                  Comment {config.commentRequired ? "(required)" : "(optional)"}
                </Label>
                <Textarea
                  id={`comment-${proposal.id}-${action}`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required={config.commentRequired}
                />
              </div>
    
              {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || (config.commentRequired && !comment.trim())}>
                  {isLoading ? "Saving…" : config.label}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    }