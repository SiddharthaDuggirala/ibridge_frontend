import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TalentPool } from "@/types/talent-pool";

// SAMPLE DATA: shown until Django's getalltalentpools is ready.
// Same shape as the API, so later this array is replaced by useGetTalentPoolsQuery().
const SAMPLE_TALENT_POOLS: TalentPool[] = [
  {
    id: 1,
    company: "Acme Consulting Inc",
    name: "Java microservices bench",
    description: "Screened Java engineers ready for submission.",
    candidate_ids: [1, 2],
    created_at: "19/11/2026 10:00:00",
  },
  {
    id: 2,
    company: "Acme Consulting Inc",
    name: "Cloud & DevOps",
    description: "Azure and AWS platform specialists.",
    candidate_ids: [3],
    created_at: "19/11/2026 10:00:00",
  },
  {
    id: 3,
    company: "Acme Consulting Inc",
    name: "US banking QA",
    description: "Onshore QA leads with banking domain.",
    candidate_ids: null,
    created_at: "19/11/2026 10:00:00",
  },
];

export function TalentPoolsSection() {
  const pools = SAMPLE_TALENT_POOLS;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Talent pools</CardTitle>
        <Badge variant="outline">Sample data</Badge>
      </CardHeader>
      <CardContent>
        {pools.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No talent pools to show yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pools.map((pool) => (
              <TalentPoolCard
                key={pool.id}
                name={pool.name}
                description={pool.description}
                candidateCount={pool.candidate_ids?.length ?? 0}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TalentPoolCard({
  name,
  description,
  candidateCount,
}: {
  name: string;
  description: string | null;
  candidateCount: number;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm font-semibold">{name}</p>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      <p className="mt-2 text-xs font-medium text-primary">{candidateCount} candidate(s)</p>
    </div>
  );
}