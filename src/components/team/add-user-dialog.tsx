import { UserPlus } from "lucide-react";
import { useState, type SubmitEvent } from "react";

import { ReportingFields } from "@/components/team/reporting-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_OPTIONS, ROLES } from "@/constants/roles";
import { useAddUserMutation } from "@/store/team-api";
import type { AddUserRequest, TeamMember } from "@/types/team";
import { reportingComplete } from "@/utils/reporting";

const EMPTY_USER: AddUserRequest = { name: "", email: "", role: "", password: "", reports_to: null, hr_for: [] };

// System admin creates a login: name, email (also the username), role, reporting line and a starting password.
// `team` is the Team page's list, used to offer the right managers.
export function AddUserDialog({ team }: { team: TeamMember[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AddUserRequest>(EMPTY_USER);
  const [addUser, { isLoading, error, reset }] = useAddUserMutation();

  // There can only be one Managing Director (Django checks this too).
  const mdTaken = team.some((person) => person.role.shortcode === ROLES.MD && person.is_active);

  // Start clean every time: no old values and no old error message.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setForm(EMPTY_USER);
      reset();
    }
    setOpen(nextOpen);
  }

  // Change one text field, keep the rest.
  function update(field: "name" | "email" | "password", value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // A different role needs a different kind of manager, so the old choice is cleared.
  function changeRole(role: string) {
    setForm((prev) => ({ ...prev, role, reports_to: null, hr_for: [] }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await addUser(form).unwrap();
      setOpen(false); // the Team list refreshes by itself (tag "Team")
    } catch {
      // Keep the dialog open; Django's message (e.g. "too short", "already has a login") shows from `error`.
    }
  }

  const canSave = form.role !== "" && reportingComplete(form.role, form.reports_to, form.hr_for);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" /> Add user
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>They log in with this email and the starting password. Share it with them privately.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-user-name">Full name</Label>
            <Input id="new-user-name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-user-email">Email (used to log in)</Label>
            <Input
              id="new-user-email"
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-user-role">Role</Label>
            <Select value={form.role} onValueChange={changeRole}>
              <SelectTrigger id="new-user-role" className="w-full">
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => {
                  const taken = option.value === ROLES.MD && mdTaken;
                  return (
                    <SelectItem key={option.value} value={option.value} disabled={taken}>
                      {option.label}
                      {taken ? " (already filled)" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* The same fields as the Reporting dialog: a manager, BU Heads for HR, or nothing. */}
          <ReportingFields
            role={form.role}
            team={team}
            reportsTo={form.reports_to}
            hrFor={form.hr_for}
            onReportsToChange={(managerId) => setForm((prev) => ({ ...prev, reports_to: managerId }))}
            onHrForChange={(buHeadIds) => setForm((prev) => ({ ...prev, hr_for: buHeadIds }))}
            idPrefix="new-user"
          />

          <div className="space-y-2">
            <Label htmlFor="new-user-password">Starting password</Label>
            <Input
              id="new-user-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">At least 8 characters, not a common word, not only numbers.</p>
          </div>

          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !canSave}>
              {isLoading ? "Adding…" : "Add user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}