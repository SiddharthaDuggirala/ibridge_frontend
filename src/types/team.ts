// A person shown by name only (a manager, or a BU Head an HR person works for).
export interface PersonRef {
  id: number;
  name: string;
}


// One person in Django's getteam list (system admin only).
export interface TeamMember {
  id: number;
  name: string;
  username: string;
  role: { shortcode: string; name: string };
  is_active: boolean;
  // What they own today: recruiters own candidates, Leads own the proposals they made.
  owns: { candidates: number; proposals: number };
  // Recruiter -> Lead -> BU Head -> MD. null for MD, HR and the system admin.
  reports_to: PersonRef | null;
  // HR only: the BU Heads they work for (empty for everyone else).
  hr_for: PersonRef[];
}

export interface TransferOwnershipRequest {
  from_user_id: number;
  to_user_id: number;
  deactivate: boolean;
}

export interface TransferOwnershipResult {
  candidates_moved: number;
  proposals_moved: number;
  reports_moved: number;
  deactivated: boolean;
}

// A new login made by the system admin. The email is also the username.
export interface AddUserRequest {
  name: string;
  email: string;
  role: string;
  password: string;
  reports_to: number | null;
  hr_for: number[];
}

// Change who someone reports to (or, for HR, which BU Heads they work for).
export interface SetReportingRequest {
  user_id: number;
  reports_to: number | null;
  hr_for: number[];
}


