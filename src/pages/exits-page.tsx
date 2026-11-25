import { useState } from "react";
import { Link } from "react-router";

import { ExitProgress } from "@/components/onboarding/exit-progress";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
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
import { useGetOnboardingsQuery } from "@/store/onboarding-api";

const COLUMN_COUNT = 7;

// Everyone who is leaving or has left. Django decides who sees whom (same list as the Onboarding page).
export function ExitsPage() {
  const { data, error, isLoading, isFetching, refetch } = useGetOnboardingsQuery();
  const exits = (data ?? []).filter((onboarding) => onboarding.exit !== null);
  const { buHeads, buHeadFilter, setBuHeadFilter, shown } = useBuHeadFilter(exits);

  // "Needs you": the rows on which Django offers this user a button.
  const [needsYouOnly, setNeedsYouOnly] = useState(false);
  const needsYou = shown.filter((onboarding) => onboarding.exit_actions.length > 0);
  const visible = needsYouOnly ? needsYou : shown;

  let emptyText = "No exits for this BU Head.";
  if (exits.length === 0) {
    emptyText = "No one has left yet.";
  } else if (needsYouOnly) {
    emptyText = "No exit needs you right now.";
  }

  return (
    <>
      <PageHeader
        title="Exits"
        description="Everyone who is leaving or has left: why, their last working day, clearance and relieving letter."
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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
          <Button
            variant={needsYouOnly ? "default" : "outline"}
            aria-pressed={needsYouOnly}
            onClick={() => setNeedsYouOnly((on) => !on)}
          >
            Needs you ({needsYou.length})
          </Button>
        </div>
        <RefreshButton onRefresh={refetch} isFetching={isFetching} />
      </div>

      <Card>
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Employee</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>BU Head</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Last working day</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <MessageRow text="Loading exits…" />
            ) : error ? (
              <MessageRow text={error.message ?? "Could not load exits."} isError />
            ) : visible.length === 0 ? (
              <MessageRow text={emptyText} />
            ) : (
              visible.map((onboarding) => (
                <TableRow key={onboarding.id}>
                  <TableCell className="px-4">
                    <Link to={`/candidates/${onboarding.candidate.id}`} className="font-medium hover:underline">
                      {onboarding.candidate.name ?? "Unnamed"}
                    </Link>
                  </TableCell>
                  <TableCell>{onboarding.client.name ?? "—"}</TableCell>
                  <TableCell>{onboarding.lead}</TableCell>
                  <TableCell>{onboarding.bu_head?.name ?? "—"}</TableCell>
                  <TableCell>{onboarding.exit?.reason_label ?? "—"}</TableCell>
                  <TableCell>{onboarding.exit?.last_working_day ?? "—"}</TableCell>
                  <TableCell>
                    {onboarding.exit ? <ExitProgress exit={onboarding.exit} size="compact" /> : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
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
