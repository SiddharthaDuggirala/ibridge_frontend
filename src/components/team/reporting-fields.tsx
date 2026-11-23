import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MANAGER_ROLE, ROLES } from "@/constants/roles";
import type { TeamMember } from "@/types/team";

// The "who do they report to" part of a form, shared by Add user and Change reporting.
// Shows a manager dropdown, BU Head checkboxes (HR), or nothing, depending on the role.

export function ReportingFields({
    role,
    team,
    excludeId,
    reportsTo,
    hrFor,
    onReportsToChange,
    onHrForChange,
    idPrefix,
  }: {
    role: string;
    team: TeamMember[];
    excludeId?: number; // the person being edited, so they cannot report to themselves
    reportsTo: number | null;
    hrFor: number[];
    onReportsToChange: (managerId: number | null) => void;
    onHrForChange: (buHeadIds: number[]) => void;
    idPrefix: string; // keeps label ids unique when several dialogs exist on one page
  }) {
    const managerRole = MANAGER_ROLE[role];
  
    if (managerRole) {
      // Only active people with the right role (e.g. Leads for a Recruiter).
      const managers = team.filter(
        (person) => person.role.shortcode === managerRole && person.is_active && person.id !== excludeId,
      );
      return (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-manager`}>Reports to</Label>
          <Select
            value={reportsTo !== null ? String(reportsTo) : ""}
            onValueChange={(value) => onReportsToChange(Number(value))}
          >
            <SelectTrigger id={`${idPrefix}-manager`} className="w-full">
              <SelectValue placeholder={managers.length > 0 ? "Choose a manager" : "No one available yet"} />
            </SelectTrigger>
            <SelectContent>
              {managers.map((person) => (
                <SelectItem key={person.id} value={String(person.id)}>
                  {person.name} ({person.role.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
  
    if (role === ROLES.HR) {
      const buHeads = team.filter((person) => person.role.shortcode === ROLES.BU_HEAD && person.is_active);
  
      // Tick adds the BU Head, untick removes them.
      function toggle(buHeadId: number, checked: boolean) {
        onHrForChange(checked ? [...hrFor, buHeadId] : hrFor.filter((id) => id !== buHeadId));
      }
  
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Works for (one or more BU Heads)</legend>
          {buHeads.length === 0 ? <p className="text-sm text-muted-foreground">No BU Heads yet.</p> : null}
          {buHeads.map((person) => (
            <div key={person.id} className="flex items-center gap-2">
              <Checkbox
                id={`${idPrefix}-bu-${person.id}`}
                checked={hrFor.includes(person.id)}
                onCheckedChange={(checked) => toggle(person.id, checked === true)}
              />
              <Label htmlFor={`${idPrefix}-bu-${person.id}`}>{person.name}</Label>
            </div>
          ))}
        </fieldset>
      );
    }
  
    return null; // MD and system admin report to nobody
  }