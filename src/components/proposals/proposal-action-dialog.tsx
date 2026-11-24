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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMoveProposalMutation } from "@/store/proposals-api";
import type { Proposal } from "@/types/proposal";

interface ActionConfig {
  label: string;
  title: string;
  commentRequired: boolean;
  variant: "default" | "outline" | "destructive";
  // Extra fields this step asks for: BGV vendor + date, or the joining date.
  fields?: "bgv" | "joining";
}

// What each Django action looks like on screen. Keys match PROPOSAL_MOVES in Django.
const ACTIONS: Record<string, ActionConfig> = {
  bu_submit: { label: "Send to MD", title: "Send to the MD for approval", commentRequired: false, variant: "default" },
  md_approve: { label: "Approve", title: "Approve this proposal", commentRequired: false, variant: "default" },
  md_send_back: { label: "Send back", title: "Send back to the BU Head", commentRequired: true, variant: "outline" },
  hr_release_offer: { label: "Release offer", title: "Release the offer letter", commentRequired: false, variant: "default" },
  lead_offer_accepted: { label: "Offer accepted", title: "The candidate accepted the offer", commentRequired: false, variant: "default" },
  lead_offer_declined: { label: "Offer declined", title: "The candidate declined the offer", commentRequired: true, variant: "outline" },
  lead_bgv_initiate: { label: "Start BGV", title: "Start background verification", commentRequired: false, variant: "default", fields: "bgv" },
  lead_bgv_success: { label: "BGV success", title: "Background verification passed", commentRequired: false, variant: "default" },
  lead_bgv_failed: { label: "BGV failed", title: "Background verification failed", commentRequired: true, variant: "destructive" },
  lead_mark_joined: { label: "Mark joined", title: "The candidate joined", commentRequired: false, variant: "default", fields: "joining" },
};

// One button + confirm dialog for one step of the journey (e.g. "Send to MD", "Start BGV").
export function ProposalActionDialog({ proposal, action }: { proposal: Proposal; action: string }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [vendor, setVendor] = useState("");
  const [initiatedOn, setInitiatedOn] = useState(""); // "YYYY-MM-DD", the DatePicker's format
  const [joiningDate, setJoiningDate] = useState(""); // "YYYY-MM-DD"
  const [moveProposal, { isLoading, error, reset }] = useMoveProposalMutation();

  const config = ACTIONS[action];
  if (!config) return null; // an action Django knows but this screen does not (yet)
  const needsBgv = config.fields === "bgv";
  const needsJoining = config.fields === "joining";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setComment("");
      setVendor("");
      setInitiatedOn("");
      setJoiningDate("");
      reset();
    }
    setOpen(nextOpen);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await moveProposal({
        proposal_id: proposal.id,
        action,
        comment,
        // Only the steps that need them send these extra fields.
        ...(needsBgv ? { bgv_vendor: vendor, bgv_initiated_on: initiatedOn } : {}),
        ...(needsJoining ? { joining_date: joiningDate } : {}),
      }).unwrap();
      setOpen(false); // the lists and progress bars refresh by themselves (tags)
    } catch {
      // Keep the dialog open; the message shows from `error`.
    }
  }

  const missing =
    (config.commentRequired && !comment.trim()) ||
    (needsBgv && (!vendor.trim() || !initiatedOn)) ||
    (needsJoining && !joiningDate);
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
          {needsBgv ? (
            <>
              <div className="space-y-2">
                <Label htmlFor={`vendor-${proposal.id}`}>BGV vendor</Label>
                <Input
                  id={`vendor-${proposal.id}`}
                  placeholder="e.g. SafeCheck"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`initiated-${proposal.id}`}>Initiated on</Label>
                <DatePicker id={`initiated-${proposal.id}`} value={initiatedOn} onChange={setInitiatedOn} />
              </div>
            </>
          ) : null}

          {needsJoining ? (
            <div className="space-y-2">
              <Label htmlFor={`joining-${proposal.id}`}>Joining date</Label>
              <DatePicker id={`joining-${proposal.id}`} value={joiningDate} onChange={setJoiningDate} />
              <p className="text-xs text-muted-foreground">
                The date in the offer letter, or later if the candidate joined late. This starts their onboarding.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`comment-${proposal.id}-${action}`}>
              {config.commentRequired ? "Reason (required)" : "Comment (optional)"}
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
            <Button
              type="submit"
              variant={config.variant === "destructive" ? "destructive" : "default"}
              disabled={isLoading || missing}
            >
              {isLoading ? "Saving…" : config.label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
