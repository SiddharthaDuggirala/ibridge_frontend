import { Network } from "lucide-react";
import { useState, type SubmitEvent } from "react";

import { ReportingFields } from "@/components/team/reporting-fields";
import { reportingComplete } from "@/utils/reporting";
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
import { useSetReportingMutation } from "@/store/team-api";
import type { TeamMember } from "@/types/team";

// Change who someone reports to, or (for HR) which BU Heads they work for.
export function ChangeReportingDialog({ member, team }: { member: TeamMember; team: TeamMember[] }) {
  const [open, setOpen] = useState(false);
  const [reportsTo, setReportsTo] = useState<number | null>(null);
  const [hrFor, setHrFor] = useState<number[]>([]);
  const [setReporting, { isLoading, error, reset }] = useSetReportingMutation();

  // Start from their current reporting line every time the dialog opens.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setReportsTo(member.reports_to?.id ?? null);
      setHrFor(member.hr_for.map((bu) => bu.id));
      reset();
    }
    setOpen(nextOpen);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await setReporting({ user_id: member.id, reports_to: reportsTo, hr_for: hrFor }).unwrap();
      setOpen(false); // Team, Candidates and Proposals refresh by themselves (tags)
    } catch {
      // Keep the dialog open; Django's message shows from `error`.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Network className="size-4" /> Reporting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{member.name}'s reporting line</DialogTitle>
          <DialogDescription>
            This decides whose candidates and proposals {member.name} can see.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ReportingFields
            role={member.role.shortcode}
            team={team}
            excludeId={member.id}
            reportsTo={reportsTo}
            hrFor={hrFor}
            onReportsToChange={setReportsTo}
            onHrForChange={setHrFor}
            idPrefix={`reporting-${member.id}`}
          />

          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !reportingComplete(member.role.shortcode, reportsTo, hrFor)}
            >
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}