export const ROLES = {

    SYSADMIN: "sa01",
  CLIENT: "cl01",
  RECRUITER: "rc01",
  LEAD: "ld01",
  BU_HEAD: "bh01",
  MD: "md01",
  HR: "hr01",
} as const;

export const ROLE_OPTIONS = [
  {value:ROLES.RECRUITER, label:"Recruiter"},
  {value: ROLES.LEAD, label:"Lead"},
  {value: ROLES.BU_HEAD, label:"BU Head"}, 
  {value: ROLES.MD, label:"MD"}, 
  {value: ROLES.HR, label:"HR"},
  {value:ROLES.SYSADMIN, label:"System Admin"},
];

// Who each role reports to (the same rule Django checks in accounts/hierarchy.py).
// Roles missing here (MD, HR, system admin) report to nobody; HR works for BU Heads instead.
export const MANAGER_ROLE: Record<string, string> = {
  [ROLES.RECRUITER]: ROLES.LEAD,
  [ROLES.LEAD]: ROLES.BU_HEAD,
  [ROLES.BU_HEAD]: ROLES.MD,
};
