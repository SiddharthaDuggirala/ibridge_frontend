import { Link } from "react-router";

import { InductionDialog } from "@/components/onboarding/induction-dialog";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { RecordExitDialog } from "@/components/onboarding/record-exit-dialog";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBuHeadFilter } from "@/hooks/use-bu-head-filter";
import { TablePagination } from "@/components/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useGetOnboardingsQuery } from "@/store/onboarding-api";
import { ExitProgress } from "@/components/onboarding/exit-progress";

const COLUMN_COUNT = 7;

// Everyone who has joined, and where they are in onboarding. Django decides who sees which joiners.
export function OnboardingPage() {
  const { data, error, isLoading, isFetching, refetch } = useGetOnboardingsQuery();
  const onboardings = data ?? [];
  const { buHeads, buHeadFilter, setBuHeadFilter, shown } = useBuHeadFilter(onboardings);
  const pages = usePagination(shown, buHeadFilter);

  return (
    <>
      <PageHeader
        title="Onboarding"
        description="New joiners from the day they join: induction now, documents, IT and payroll later."
      />

      <div className="flex items-center justify-between gap-3">
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
              <TableHead>Lead</TableHead>
              <TableHead>BU Head</TableHead>
              <TableHead>Joining date</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <MessageRow text="Loading onboarding…" />
            ) : error ? (
              <MessageRow text={error.message ?? "Could not load onboarding."} isError />
            ) : shown.length === 0 ? (
              <MessageRow text={onboardings.length === 0 ? "No one has joined yet." : "No joiners for this BU Head."} />
            ) : (
              pages.pageRows.map((onboarding) => (
                <TableRow key={onboarding.id}>
                  <TableCell className="px-4">
                    <Link to={`/candidates/${onboarding.candidate.id}`} className="font-medium hover:underline">
                      {onboarding.candidate.name ?? "Unnamed"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {[onboarding.candidate.primary_skill, onboarding.candidate.location].filter(Boolean).join(" · ")}
                    </p>
                  </TableCell>
                  <TableCell>{onboarding.client.name ?? "—"}</TableCell>
                  <TableCell>{onboarding.lead}</TableCell>
                  <TableCell>{onboarding.bu_head?.name ?? "—"}</TableCell>
                  <TableCell>{onboarding.joining_date ?? "—"}</TableCell>
                  <TableCell>
                  {onboarding.exit ? (
                      <ExitProgress exit={onboarding.exit} size="compact" />
                    ) : (
                      <OnboardingProgress onboarding={onboarding} size="compact" />
                    )}
                  </TableCell>
                  <TableCell>
                    {onboarding.allowed_actions.includes("hr_induction_done") ? (
                      <InductionDialog onboarding={onboarding} />
                    ) : null}
                    {onboarding.exit_actions.includes("record_exit") ? (
                      <RecordExitDialog onboarding={onboarding} />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      <TablePagination {...pages} />
    </>
  );
}

// One full-width row for loading / error / empty messages.
function MessageRow({ text, isError = false }: { text: string; isError?: boolean }) {
  return (
    <TableRow>
      <TableCell
        colSpan={COLUMN_COUNT}
        className={isError ? "py-12 text-center text-destructive" : "py-12 text-center text-muted-foreground"}
      >
        {text}
      </TableCell>
    </TableRow>
  );
}
