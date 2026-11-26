import { PageHeader } from "@/components/page-header";
import { StatTile } from "@/components/stat-tile";
import { useGetDashboardQuery } from "@/store/dashboard-api";
import {AllEntities} from "@/components/dashboard/all-entities";
import {RecentActivityCard, PlatformHealthCard} from "@/components/dashboard/activity-and-health";

export function DashboardPage() {
  const { data, error, isLoading } = useGetDashboardQuery();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">{error?.message ?? "No data."}</p>;
  }

  return (
    <>
      <PageHeader
        title="System administration"
        description="Workforce overview across all clients."
      />
      <div className="grid gap-3 sm:grid-cols-5 xl:grid-cols-5">
        <StatTile label="PEOPLE"
          value={data.people}
          hint="Active logins"
          />
        
        <StatTile 
          label="CANDIDATES"
          value={data.candidates}
          hint="In the candidate database"
          />

        <StatTile label="EMPLOYEES"
          value={data.employees}
          hint="Working or on the bench"
          />

        <StatTile label="PENDING APPROVALS"
          value={data.pending_approvals}
          hint="Waiting for BU Head, MD or HR"
          tone={data.pending_approvals > 0 ? "warning" : "default"}
          />

        <StatTile label="AUDIT ENTRIES"
          value={data.audit_entries}
          hint="Recorded steps and changes"
          />       
      </div>
      <AllEntities />
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentActivityCard recent={data.recent} />
        <PlatformHealthCard
          people={data.people}
          pendingApprovals={data.pending_approvals}
          auditEntries={data.audit_entries}
        />
      </div>
    </>
  );
}