import { Ban } from "lucide-react";
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
import { useUnblockProposalsMutation } from "@/store/candidates-api";
import type { Candidate } from "@/types/candidate";

// The red strip on the candidate page while new proposals are blocked (a non-performance exit).
// The sysadmin and the MD also get "Allow proposals again"; everyone else only reads why.
export function ProposalBlockCard({ candidate }: { candidate: Candidate }) {
  if (!candidate.proposal_block) {
    return null;
  }
  return (
    <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
      <Ban className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">New proposals are blocked</p>
        <p className="text-muted-foreground">{candidate.proposal_block}</p>
      </div>
      {candidate.can_unblock ? <UnblockDialog candidate={candidate} /> : null}
    </div>
  );
}

function UnblockDialog({ candidate }: { candidate: Candidate }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [unblock, { isLoading, error, reset }] = useUnblockProposalsMutation();

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setComment("");
      reset(); // no old error message
    }
    setOpen(nextOpen);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await unblock({ candidate_id: candidate.id, comment }).unwrap();
      setOpen(false); // the strip disappears and the life cycle shows the step (tags)
    } catch {
      // Keep the dialog open; Django's message shows from `error`.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="shrink-0">
          Allow proposals again
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Allow proposals again</DialogTitle>
          <DialogDescription>
            {candidate.name ?? "This candidate"} can then be proposed to any client. Your comment goes into the history.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`unblock-comment-${candidate.id}`}>Why?</Label>
            <Textarea
              id={`unblock-comment-${candidate.id}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Improved after training"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || comment.trim() === ""}>
              {isLoading ? "Saving…" : "Allow proposals"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
