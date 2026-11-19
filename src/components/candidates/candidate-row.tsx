import { Link } from "react-router";
import { labelFor, money } from "@/utils/candidate-format";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { CANDIDATE_SOURCES, CANDIDATE_STATUSES } from "@/constants/candidates";
import type { Candidate } from "@/types/candidate";
import { toSkillList } from "@/utils/skills";
import { CandidateFormDialog } from "@/components/candidates/candidate-form-dialog";
import { DeleteCandidateButton } from "@/components/candidates/delete-candidate-button";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";


const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  placed: "secondary",
  inactive: "outline",
  blacklisted: "destructive",
};

export function CandidateRow({ candidate }: { candidate: Candidate }) {
  const experience = `${candidate.experience_years ?? 0}y ${candidate.experience_months ?? 0}m`;

  return (
    <TableRow>
      <TableCell className="px-4">
        <Link to={`/candidates/${candidate.id}`} className="font-medium hover:underline">
          {candidate.name ?? "Unnamed"}
        </Link>
        <p className="text-xs text-muted-foreground">
          {candidate.location ?? "—"} · {experience}
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
      <TableCell>{labelFor(CANDIDATE_SOURCES, candidate.source)}</TableCell>
      <TableCell>{candidate.notice_days != null ? `${candidate.notice_days} days` : "—"}</TableCell>
      <TableCell>
        {money(candidate.current_ctc_amount)} / {money(candidate.expected_ctc_amount)}
      </TableCell>
      
      <TableCell>
      {candidate.status ? (
          <Badge variant={STATUS_VARIANT[candidate.status] ?? "outline"}>
            {labelFor(CANDIDATE_STATUSES, candidate.status)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">Not set</span>
        )}
      </TableCell>
      
      <TableCell>{candidate.owner ?? "—"}</TableCell>
      <TableCell className="text-right whitespace-nowrap">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/candidates/${candidate.id}`} aria-label={`View ${candidate.name ?? "candidate"}`}>
            <Eye className="size-4" />
          </Link>
        </Button>
        <CandidateFormDialog candidate={candidate} />
        <DeleteCandidateButton id={candidate.id} name={candidate.name ?? "this candidate"} />
      </TableCell>
    </TableRow>
  );
}