import { MANAGER_ROLE, ROLES } from "@/constants/roles";

// True for roles that need a reporting line: a manager (Recruiter, Lead, BU Head) or BU Heads (HR).
export function needsReporting(role: string): boolean {
    return role in MANAGER_ROLE || role === ROLES.HR;
  }


// True when the chosen values are complete enough to save for this role.
export function reportingComplete(role: string, reportsTo: number | null, hrFor: number[]): boolean {
    if (role in MANAGER_ROLE) return reportsTo !== null;
    if (role === ROLES.HR) return hrFor.length > 0;
    return true;
  }