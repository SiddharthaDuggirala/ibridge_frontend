import { format } from "date-fns";
import { CornerUpLeft } from "lucide-react";

import { ProposalProgress } from "@/components/candidates/proposal-progress";
import { useGetProposalHistoryQuery } from "@/store/proposals-api";
import type { CandidateProposal } from "@/types/candidate";
import { parseDjangoDateTime } from "@/utils/dates";

const ACTION_LABELS: Record<string, string> = {
    proposed: "Proposed to the client",
    bill_rate_changed: "Bill rate changed",
    bu_submit: "Sent to the MD",
    md_approve: "Approved by the MD",
    md_send_back: "Sent back to the BU Head",
  };

function readableTime(at: string): string {
    const when = parseDjangoDateTime(at);
    return when ? format(when, "d MMM yyyy, h:mm a") : at;
  }

// One proposal on the candidate page: client name, the stepper with who/when, a sent-back note, and the full history.
export function ProposalJourney({ proposal }: { proposal: CandidateProposal }) {
    // Each proposal loads its own history, which is why this is its own component (hooks cannot go inside .map).
    const { data: history = [] } = useGetProposalHistoryQuery({ proposal_id: proposal.id });
  
    // At bu_review after a send-back, the latest send-back explains why it came back.
    const sentBack =
      proposal.stage === "bu_review" ? history.findLast((entry) => entry.action === "md_send_back") : undefined;
  
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">{proposal.client}</p>
  
        <ProposalProgress stage={proposal.stage} label={proposal.client} history={history} />
  
        {sentBack ? (
          <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <CornerUpLeft className="mt-0.5 size-4 shrink-0" />
            <p>
              <span className="font-medium">Sent back by {sentBack.by}</span> on {readableTime(sentBack.at)}
              {sentBack.comment ? <>: “{sentBack.comment}”</> : null}
            </p>
          </div>
        ) : null}
  
        {history.length > 0 ? (
          <details className="text-sm">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              History ({history.length})
            </summary>
            <ol className="mt-2 space-y-2 border-l border-border pl-4">
              {history.map((entry) => (
                <li key={entry.id}>
                  <p>
                    <span className="font-medium">{ACTION_LABELS[entry.action] ?? entry.action}</span>
                    <span className="text-muted-foreground"> · {entry.by} · {readableTime(entry.at)}</span>
                  </p>
                  {entry.comment ? <p className="text-muted-foreground">“{entry.comment}”</p> : null}
                </li>
              ))}
            </ol>
          </details>
        ) : null}
      </div>
    );
  }