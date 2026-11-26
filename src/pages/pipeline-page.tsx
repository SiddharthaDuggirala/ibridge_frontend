import { TriangleAlert } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useGetPipelineQuery } from "@/store/pipeline-api";
import type { PipelineCounts } from "@/types/pipeline";

// The MD's dashboard: one row per BU Head, how many candidates sit at each stage, and how many are stuck.


export function PipelinePage() {

    const {data, isLoading, error, isFetching, refetch} = useGetPipelineQuery();
    const rows = data?.rows ?? [];
    const columns = data?.columns ?? [];
    const columnCount = columns.length + 3;
    // The numbers of one row (a BU Head or the totals), drawn the same way for both.

    function countCells(values: PipelineCounts) {
        return (
          <>
            {columns.map((column) => {
              const count = values.counts[column.key] ?? 0;
              return (
                <TableCell key={column.key} className={cn("text-center tabular-nums", count === 0 && "text-muted-foreground/50")}>
                  {count}
                </TableCell>
              );
            })}
            <TableCell className="text-center font-semibold tabular-nums">{values.total}</TableCell>
            <TableCell className="text-center">
              {values.stuck > 0 ? (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                  <TriangleAlert className="size-4" /> {values.stuck}
                </span>
              ) : (
                <span className="text-muted-foreground/50">0</span>
              )}
            </TableCell>
          </>
        );
      }

    return (
        <>
        <PageHeader title="Pipeline" 
         description={`Where every candidate is, per BU Head. "Stuck" means waiting ${data?.stuck_after_days ?? 3}
          days or more at the same step.`} />

        <div className="flex items-center justify-end gap-3">
            <RefreshButton onRefresh={refetch} isFetching={isFetching} />
        </div>

        <Card>
            <Table className="min-w-[1000px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-4">BU Head</TableHead>
                        {
                            columns.map((column) => (
                                <TableHead key={column.key} className="text-center">
                                    {column.label}
                                </TableHead>
                            ))}
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Stuck</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    <MessageRow text="Loading pipeline…" colSpan={columnCount} />
                    ) : error ? (
                    <MessageRow text={error.message ?? "Could not load the pipeline."} colSpan={columnCount} isError />
                    ) : rows.length === 0 ? (
                    <MessageRow text="No candidates in the pipeline yet." colSpan={columnCount} />
                    ) : (
                    rows.map((row) => (
                        <TableRow key={row.bu_head?.id ?? "none"}>
                        <TableCell className="px-4 font-medium">{row.bu_head?.name ?? "No BU Head"}</TableCell>
                        {countCells(row)}
                        </TableRow>
                    ))
                    )}
                </TableBody>
                 {/* Only worth a totals row when there is more than one BU Head. */}
                    {data && rows.length > 1 ? (
                        <TableFooter>
                        <TableRow>
                            <TableCell className="px-4 font-semibold">Total</TableCell>
                            {countCells(data.totals)}
                        </TableRow>
                        </TableFooter>
                    ) : null}
            </Table>
        </Card>

        </>
    )

}

// One full-width row for loading / error / empty messages.
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