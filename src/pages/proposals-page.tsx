import {Link} from "react-router";
import {useState} from "react";
import { ProposalProgress } from "@/components/candidates/proposal-progress";
import {PageHeader} from "@/components/page-header";
import {Card} from "@/components/ui/card";
import { RefreshButton } from "@/components/refresh-button";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useGetProposalsQuery } from "@/store/proposals-api";
import { hourlyRate } from "@/utils/candidate-format";
import { ProposalActionDialog } from "@/components/proposals/proposal-action-dialog";
import { EditRateDialog } from "@/components/proposals/edit-rate-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBuHeadFilter } from "@/hooks/use-bu-head-filter";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/constants/roles";
import { getRole } from "@/store/token";


export function ProposalPage() {
    const { data, error, isLoading, refetch, isFetching} = useGetProposalsQuery();
    const proposals = data ?? [];

    const showMoney = proposals.some((proposal) => "bill_rate_hourly" in proposal);
    const columnCount  = showMoney ? 7:5;
    const {buHeadFilter,buHeads, setBuHeadFilter, shown} = useBuHeadFilter(proposals);
    // "Waiting for you": Django sends the moves this user may make on each proposal, so a non-empty list means it needs them.
    const [waitingOnly, setWaitingOnly] = useState(false);
    const waiting = shown.filter((proposal) => proposal.allowed_actions.length > 0);
    const visible = waitingOnly ? waiting : shown;
    const pages = usePagination(visible, `${buHeadFilter}|${waitingOnly}`);
    // Recruiters never move a proposal, so the toggle would always say 0 for them.
    const canAct = getRole() !== ROLES.RECRUITER;

    let emptyText = "No proposals for this BU Head.";
    if (proposals.length === 0) {
      emptyText = "No proposals yet.";
    } else if (waitingOnly) {
      emptyText = "Nothing is waiting for you right now.";
    }

    return (
        <>
        <PageHeader title="Proposals" description="Every candidate proposed to a client, and where each one is in the approvals."/>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Only worth showing when the list spans more than one BU Head (the MD and sa01). */}
            {buHeads.length > 1 ? (
              <Select value={buHeadFilter} onValueChange={setBuHeadFilter}>
                <SelectTrigger className="w-56" aria-label="Filter by BU Head">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All BU Heads</SelectItem>
                  {buHeads.map((buHead) => (
                    <SelectItem key={buHead.id} value={String(buHead.id)}>
                      {buHead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {canAct ? (
              <Button
                variant={waitingOnly ? "default" : "outline"}
                aria-pressed={waitingOnly}
                onClick={() => setWaitingOnly((on) => !on)}
              >
                Waiting for you ({waiting.length})
              </Button>
            ) : null}
          </div>
            <RefreshButton onRefresh={refetch} isFetching={isFetching} />
        </div>
        <Card>
            <Table className="min-w-[900px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-4">Candidate</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Progress</TableHead>
                        {showMoney ? <TableHead>Bill rate</TableHead> : null}
                        {showMoney ? <TableHead>Gross margin</TableHead> : null}
                        <TableHead>Proposed by</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                         <MessageRow text="Loading proposals…" colSpan={columnCount} />
                    ) : error ? (
                        <MessageRow text={error.message ?? "Could not load proposals."} colSpan={columnCount} isError />
                    ): visible.length === 0 ? (
                      <MessageRow text={emptyText} colSpan={columnCount} />
                    ) : (
                        pages.pageRows.map((proposal) => (
                            <TableRow key={proposal.id}>
                            <TableCell className="px-4">
                              <Link to={`/candidates/${proposal.candidate.id}`} className="font-medium hover:underline">
                                {proposal.candidate.name ?? "Unnamed"}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {[proposal.candidate.primary_skill, proposal.candidate.location].filter(Boolean).join(" · ")}
                              </p>
                            </TableCell>
                            <TableCell>{proposal.client.name ?? "—"}</TableCell>
                            <TableCell>
                              <ProposalProgress stage={proposal.stage} label={proposal.client.name ?? ""} size="compact" />
                            </TableCell>
                            {showMoney ? (
                              <TableCell>{hourlyRate(proposal.bill_rate_hourly, proposal.bill_rate_currency)}</TableCell>
                            ) : null}
                            {showMoney ? (
                              <TableCell>
                                {proposal.gross_margin_amount != null ? (
                                  `${proposal.gross_margin_amount} (${proposal.gross_margin_percent}%)`
                                ) : (
                                  <span className="text-muted-foreground">Formula pending</span>
                                )}
                              </TableCell>
                            ) : null}
                            <TableCell>
                              {proposal.proposed_by}
                              <p className="text-xs text-muted-foreground">{proposal.created_on}</p>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                {proposal.can_edit ? <EditRateDialog proposal={proposal} /> : null}
                                {proposal.allowed_actions.map((action) => (
                                  <ProposalActionDialog key={action} proposal={proposal} action={action} />
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                    
                </TableBody>
            </Table>
        </Card>
        <TablePagination {...pages} />
            
        </>
    )

} 

function MessageRow({ text, colSpan, isError = false }: { text: string; colSpan: number; isError?: boolean }) {
    return (
      <TableRow>
        <TableCell
          colSpan={colSpan}
          className={isError ? "py-12 text-center text-destructive" : "py-12 text-center text-muted-foreground"}
        >
          {text}
        </TableCell>
      </TableRow>
    );
  }