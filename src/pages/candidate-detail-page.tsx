import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { CandidateFormDialog } from "@/components/candidates/candidate-form-dialog";
import { DeleteCandidateButton } from "@/components/candidates/delete-candidate-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CANDIDATE_SOURCES, CANDIDATE_STATUSES } from "@/constants/candidates";
import { useGetCandidateQuery } from "@/store/candidates-api";
import { labelFor, money } from "@/utils/candidate-format";
import { toSkillList } from "@/utils/skills";
import { ProposalProgress } from "@/components/candidates/proposal-progress";
import { ProposalJourney } from "@/components/proposals/proposal-journey";
import { LifeCycleCard } from "@/components/candidates/life-cycle-card";
import { ProposalBlockCard } from "@/components/candidates/proposal-block-card";


export function CandidateDetailPage() {
    // /candidates/7 -> id is the string "7" (URL parts are always strings).
    const { id } = useParams();
    const candidateId = Number(id);
    const navigate = useNavigate();
  
    // skip: don't call Django at all when the URL has no valid number.
    const { data: candidate, error, isLoading } = useGetCandidateQuery({ candidate_id: candidateId }, {
      skip: !candidateId,
    });
  
    const backButton = (
      <Button variant="outline" asChild>
        <Link to="/candidates">
          <ArrowLeft className="size-4" /> All candidates
        </Link>
      </Button>
    );
  
    if (isLoading) {
      return <p className="text-sm text-muted-foreground">Loading candidate…</p>;
    }
  
    if (!candidateId || error || !candidate) {
      return (
        <>
          <PageHeader title="Candidate not found" actions={backButton} />
          <p className="text-sm text-destructive">
            {error?.message ?? "This candidate does not exist."}
          </p>
        </>
      );
    }
  
    const name = candidate.name ?? "Unnamed";
    const skills = toSkillList(candidate.skills);

    return (
        <>
          <PageHeader
            title={name}
            description={[candidate.primary_skill, candidate.location].filter(Boolean).join(" · ")}
            actions={
              <>
                {backButton}
                {candidate.can_edit ? <CandidateFormDialog candidate={candidate} /> : null}
                {candidate.can_delete ? (
                <DeleteCandidateButton
                  id={candidate.id}
                  name={name}
                  onDeleted={() => navigate("/candidates")}
                />
                ) : null}
              </>
            }
          />
          <ProposalBlockCard candidate={candidate} />
          <Card>
            <CardHeader>
              <CardTitle>Approval progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {candidate.proposals.length === 0 ? (
                <>
                  <ProposalProgress stage={null} label="" />
                  <p className="text-sm text-muted-foreground">
                    Not proposed to a client yet. The Lead picks the client and the hourly bill rate.
                  </p>
                </>
              ) : (
                candidate.proposals.map((proposal) => <ProposalJourney key={proposal.id} proposal={proposal} />))
              }
            </CardContent>
          </Card>
          <LifeCycleCard candidateId={candidate.id} />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <Field label="Email" value={candidate.email} />
                <Field label="Phone" value={candidate.phone} />
                <Field label="Location" value={candidate.location} />
              </CardContent>
            </Card>
    
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <Field
                  label="Experience"
                  value={`${candidate.experience_years ?? 0}y ${candidate.experience_months ?? 0}m`}
                />
                <Field
                  label="Notice"
                  value={candidate.notice_days != null ? `${candidate.notice_days} days` : null}
                />
                <Field label="Availability" value={candidate.availability} />
                <Field
                  label="Current / expected CTC"
                  value={`${money(candidate.current_ctc_amount)} / ${money(candidate.expected_ctc_amount)}`}
                />
              </CardContent>
            </Card>
    
            <Card>
              <CardHeader>
                <CardTitle>Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Field label="Status" value={labelFor(CANDIDATE_STATUSES, candidate.status)} />
                <Field label="Source" value={labelFor(CANDIDATE_SOURCES, candidate.source)} />
                <Field label="Owner" value={candidate.owner} />
                <Field label="Last contacted" value={candidate.last_contacted_on} />
                <Field label="Added on" value={candidate.created_on} />
              </CardContent>
            </Card>
          </div>
    
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              {skills.length === 0 ? (
                <span className="text-sm text-muted-foreground">No skills listed.</span>
              ) : (
                skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
    
          <Card>
            <CardHeader>
              <CardTitle>Recruiter notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm">
                {candidate.recruiter_notes ?? "No notes yet."}
              </p>
              {candidate.cv_url ? (
                <a
                  href={candidate.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-primary underline"
                >
                  Open CV
                </a>
              ) : null}
            </CardContent>
          </Card>
        </>
      );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right font-medium">{value || "—"}</span>
        </div>
    );
    }