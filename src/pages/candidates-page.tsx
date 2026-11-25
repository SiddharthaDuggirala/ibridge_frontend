import { Search, Upload } from "lucide-react";
import { useState } from "react";

import { CandidateRow } from "@/components/candidates/candidate-row";
import { CandidateFormDialog } from "@/components/candidates/candidate-form-dialog";
import { TalentPoolsSection } from "@/components/candidates/talent-pools-section";
import { PageHeader } from "@/components/page-header";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCandidatesQuery } from "@/store/candidates-api";
import { toSkillList } from "@/utils/skills";
import { RefreshButton } from "@/components/refresh-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



// Which people the list shows. Those who left are hidden until asked for; nobody is ever deleted.
type ShowFilter = "current" | "left" | "everyone";

export function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [show, setShow] = useState<ShowFilter>("current");
  const { data, error, isLoading, refetch, isFetching } = useGetCandidatesQuery();

  const candidates = data ?? [];

  // Tiles: counted from the full list.
  const available = candidates.filter(
    (c) => c.current.key === "available" && c.status === "active" && (c.notice_days ?? 0) <= 30,
  ).length;
  // Someone serving their last days is still working there.
  const working = candidates.filter((c) => ["working", "leaving"].includes(c.current.key)).length;
  const onBench = candidates.filter((c) => c.current.key === "bench").length;
  const leftCount = candidates.filter((c) => c.current.key === "left").length;

  // Search: name, any skill, or city (ignores upper/lower case).
  const term = search.trim().toLowerCase();
  const shown = candidates.filter((c) => {
    const left = c.current.key === "left";
    if (show === "current" && left) return false;
    if (show === "left" && !left) return false;
    if (!term) return true;
    const text = [c.name, c.location, c.primary_skill, ...toSkillList(c.skills ?? [])]
      .join(" ")
      .toLowerCase();
    return text.includes(term);
  });

  return (
    <>
      <PageHeader
        title="Candidates"
        description="The reusable talent database behind every requirement."
        actions={
          <>
            <Button variant="outline" disabled>
              <Upload className="size-4" /> Bulk upload
            </Button>
            <CandidateFormDialog />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Candidates" value={isLoading ? "—" : candidates.length} />
        <StatTile label="Available now" value={isLoading ? "—" : available} hint="Active, notice ≤ 30 days" tone="positive" />
        <StatTile label="Working" value={isLoading ? "—" : working} hint="Placed with a client" />
        <StatTile label="On bench" value={isLoading ? "—" : onBench} hint="Free for the next client" tone="warning" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by name, skill or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search candidates"
          />
        </div>
        <Select value={show} onValueChange={(value) => setShow(value as ShowFilter)}>
          <SelectTrigger className="mr-auto w-48" aria-label="Which people to show">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current people</SelectItem>
            <SelectItem value="left">Left ({leftCount})</SelectItem>
            <SelectItem value="everyone">Everyone</SelectItem>
          </SelectContent>
        </Select>
        <RefreshButton onRefresh={refetch} isFetching={isFetching} />
      </div>

      <Card>
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Candidate</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Notice</TableHead>
              <TableHead>Current / expected</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead >Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <MessageRow text="Loading candidates…" />
            ) : error ? (
              <MessageRow text={error.message ?? "Could not load candidates."} isError />
            ) : shown.length === 0 ? (
              <MessageRow text={candidates.length === 0 ? "No candidates yet." : term ? "No candidates match your search." : "No one to show here."} />
            ) : (
              shown.map((candidate) => <CandidateRow key={candidate.id} candidate={candidate} />)
            )}
          </TableBody>
        </Table>
      </Card>
      <p className="text-xs text-muted-foreground">
        {shown.length} of {candidates.length} record(s)
      </p>

      <TalentPoolsSection />
    </>
  );
}

// One full-width row for loading / error / empty messages.
function MessageRow({ text, isError = false }: { text: string; isError?: boolean }) {
  return (
    <TableRow>
      <TableCell
        colSpan={9}
        className={isError ? "py-12 text-center text-destructive" : "py-12 text-center text-muted-foreground"}
      >
        {text}
      </TableCell>
    </TableRow>
  );
}