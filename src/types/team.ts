// One person in Django's getteam list (system admin only).
export interface TeamMember {
    id: number;
    name: string;
    username: string;
    role: { shortcode: string; name: string };
    is_active: boolean;
    // What they own today: recruiters own candidates, Leads own the proposals they made.
    owns: { candidates: number; proposals: number };
  }
  
  export interface TransferOwnershipRequest {
    from_user_id: number;
    to_user_id: number;
    deactivate: boolean;
  }
  
  export interface TransferOwnershipResult {
    candidates_moved: number;
    proposals_moved: number;
    deactivated: boolean;
  }