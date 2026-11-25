import { Link } from "react-router";

import { ProposeDialog } from "@/components/candidates/propose-dialog";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useGetCandidatesQuery } from "@/store/candidates-api";
import { toSkillList } from "@/utils/skills";

const COLUMN_COUNT = 6;

// Someone waiting this many days turns amber.
const LONG_AFTER_DAYS = 30;

// Everyone whose assignment is completed and who has not joined the next client yet, longest wait first.
export function BenchPage() {
  // The same list as the Candidates page, so RTK Query shares one request between them.
  const { data, error, isLoading, isFetching, refetch } = useGetCandidatesQuery();
  const bench = (data ?? [])
    .filter((candidate) => candidate.current.key === "bench")
    .sort((a, b) => (b.current.days ?? 0) - (a.current.days ?? 0));
  const pages = usePagination(bench);

  return (
    <>
      <PageHeader
        title="Bench"
        description="People whose assignment is completed and who are free for the next client, longest wait first."
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {bench.length} {bench.length === 1 ? "person" : "people"} on the bench
        </p>
        <RefreshButton onRefresh={refetch} isFetching={isFetching} />
      </div>

      <Card>
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Candidate</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Last client</TableHead>
              <TableHead>On bench since</TableHead>
              <TableHead>Next client</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <MessageRow text="Loading bench…" />
            ) : error ? (
              <MessageRow text={error.message ?? "Could not load the bench."} isError />
            ) : bench.length === 0 ? (
              <MessageRow text="Nobody is on the bench." />
            ) : (
              pages.pageRows.map((candidate) => {
                const days = candidate.current.days ?? 0;
                const proposedTo = candidate.proposals.filter((proposal) => proposal.is_open);
                return (
                  <TableRow key={candidate.id}>
                    <TableCell className="px-4">
                      <Link to={`/candidates/${candidate.id}`} className="font-medium hover:underline">
                        {candidate.name ?? "Unnamed"}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {[candidate.primary_skill, candidate.location].filter(Boolean).join(" · ")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {toSkillList(candidate.skills ?? []).map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{candidate.current.client ?? "—"}</TableCell>
                    <TableCell>
                      {candidate.current.since ?? "—"}
                      <p
                        className={cn(
                          "text-xs",
                          days >= LONG_AFTER_DAYS ? "font-medium text-amber-600" : "text-muted-foreground",
                        )}
                      >
                        {days} day{days === 1 ? "" : "s"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {proposedTo.length > 0 ? (
                        `Proposed to ${proposedTo.map((proposal) => proposal.client).join(", ")}`
                      ) : (
                        <span className="text-muted-foreground">Not proposed yet</span>
                      )}
                    </TableCell>
                    <TableCell>{candidate.can_propose ? <ProposeDialog candidate={candidate} /> : null}</TableCell>
                  </TableRow>
                );
              })
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