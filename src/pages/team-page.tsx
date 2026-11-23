import { PageHeader } from "@/components/page-header";
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
import { useGetTeamQuery } from "@/store/team-api";
import type { TeamMember } from "@/types/team";
import { TransferDialog } from "@/components/team/transfer-dialog";
import { AddUserDialog } from "@/components/team/add-user-dialog";
import { ChangeReportingDialog } from "@/components/team/change-reporting-dialog";
import { needsReporting } from "@/utils/reporting";


// "2 candidates · 1 proposal", or "Nothing" when they own nothing.
function ownsText(owns: TeamMember["owns"]): string {
    const parts: string[] = [];
    if (owns.candidates > 0) parts.push(`${owns.candidates} candidate${owns.candidates === 1 ? "" : "s"}`);
    if (owns.proposals > 0) parts.push(`${owns.proposals} proposal${owns.proposals === 1 ? "" : "s"}`);
    return parts.length > 0 ? parts.join(" · ") : "Nothing";
  }
// "Lead 1", or for HR "Works for: BU1, BU2", or "—" for people who report to nobody.
function reportingText(member: TeamMember): string {
  if (member.reports_to) return member.reports_to.name;
  if (member.hr_for.length > 0) return `Works for: ${member.hr_for.map((bu) => bu.name).join(", ")}`;
  return "—";
}

  // System admin only: everyone with a login, their role, and what they own.
  export function TeamPage() {
    const { data, error, isLoading } = useGetTeamQuery();
    const team = data ?? [];
  
    return (
      <>
        <PageHeader
          title="Team"
          description="Everyone with a login. When someone leaves, hand their work to a colleague before deactivating them."
          actions={<AddUserDialog team={team} />}
        />
  
        <Card>
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Person</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reports to</TableHead>
                <TableHead>Owns</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <MessageRow text="Loading team…" />
              ) : error ? (
                <MessageRow text={error.message ?? "Could not load the team."} isError />
              ) : team.length === 0 ? (
                <MessageRow text="No users yet." />
              ) : (
                team.map((member) => (
                  <TableRow key={member.id} className={member.is_active ? undefined : "opacity-60"}>
                    <TableCell className="px-4">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.username}</p>
                    </TableCell>
                    <TableCell>{member.role.name}</TableCell>
                    <TableCell>
                      {member.is_active ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="outline">Deactivated</Badge>
                      )}
                    </TableCell>
                    <TableCell>{reportingText(member)}</TableCell>
                    <TableCell>{ownsText(member.owns)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {member.is_active && needsReporting(member.role.shortcode) ? (
                          <ChangeReportingDialog member={member} team={team} />
                        ) : null}
                        {member.role.shortcode !== "sa01" ? (
                          <TransferDialog member={member} team={team} />
                        ) : null}
                      </div>
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
          colSpan={6  }
          className={isError ? "py-12 text-center text-destructive" : "py-12 text-center text-muted-foreground"}
        >
          {text}
        </TableCell>
      </TableRow>
    );
  }