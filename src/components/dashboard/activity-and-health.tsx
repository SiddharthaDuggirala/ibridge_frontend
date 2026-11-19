import { Activity, AlertTriangle, History, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentActivityCard() {

    return (
        <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4" /> Recent platform activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="py-6 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
      </CardContent>
    </Card>
    )
}

export function PlatformHealthCard({
    people,
    pendingApprovals,
    auditEntries,
  }: {
    people: number;
    pendingApprovals: number;
    auditEntries: number;
  }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4" /> Platform health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <HealthRow icon={Users} label="Accounts" value={`${people} people with access`} />
          <HealthRow
            icon={AlertTriangle}
            label="Attention required"
            value={`${pendingApprovals} approvals pending`}
          />
          <HealthRow icon={History} label="Audit trail" value={`${auditEntries} recorded events`} />
        </CardContent>
      </Card>
    );
  }


  function HealthRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border p-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{value}</p>
        </div>
      </div>
    );
  }