import {Link} from "react-router";

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
import { useGetProposalsQuery } from "@/store/proposals-api";
import { hourlyRate } from "@/utils/candidate-format";
import { ProposalActionDialog } from "@/components/proposals/proposal-action-dialog";
import { EditRateDialog } from "@/components/proposals/edit-rate-dialog";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PersonRef } from "@/types/team";


export function ProposalPage() {
    const { data, error, isLoading, refetch, isFetching} = useGetProposalsQuery();
    const proposals = data ?? [];

    const showMoney = proposals.some((proposal) => "bill_rate_hourly" in proposal);
    const columnCount  = showMoney ? 7:5;
    const [buHeadFilter, setBuHeadFilter] = useState("all");
    // Every BU Head that appears in the list, once each (a Map keeps one entry per id), sorted by name.
    const buHeadsById = new Map<number, PersonRef>();
    for (const proposal of proposals) {
      if (proposal.bu_head) buHeadsById.set(proposal.bu_head.id, proposal.bu_head);
    }
    const buHeads = [...buHeadsById.values()].sort((a, b) => a.name.localeCompare(b.name));
    const shown =
    buHeadFilter === "all"
      ? proposals
      : proposals.filter((proposal) => String(proposal.bu_head?.id) === buHeadFilter);

    return (
        <>
        <PageHeader title="Proposals" description="Every candidate proposed to a client, and where each one is in the approvals."/>

        <div className="flex items-center justify-between gap-3">
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
            ) : (
              <div />
            )}
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
                    ): shown.length === 0 ? (
                        <MessageRow
                          text={proposals.length === 0 ? "No proposals yet." : "No proposals for this BU Head."}
                          colSpan={columnCount}
                        />
                    ) : (
                        shown.map((proposal) => (
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