import type { PersonRef } from "@/types/team";
import type { IdentityField } from "@/types/candidate";

export interface Proposal {
    id: number;
    candidate: { id: number; name: string | null; primary_skill: string; location: string | null;
      identity_missing: IdentityField[] };
    client: { id: number; name: string | null };
    stage: string;
    proposed_by: string;
    // The BU Head above the Lead who proposed it (null if proposed by someone outside the hierarchy).
    bu_head: PersonRef | null;
    created_on: string;
    can_edit: boolean;
    allowed_actions: string[];
    bill_rate_hourly?: number;
    bill_rate_currency?: string;
    gross_margin_amount?: number | null;
    gross_margin_percent?: number | null;
    // Background verification, once the Lead has started it (null before that).
    bgv: ProposalBgv | null;
    // The onboarding case, once the Lead has marked the candidate joined (null before that).
    onboarding: ProposalOnboarding | null;
  }

// A short view of the onboarding case started from a proposal. Dates arrive as "dd/mm/YYYY".
export interface ProposalOnboarding {
  id: number;
  stage: string;
  joining_date: string | null;
  induction_date: string | null;
}

// The latest background verification of a proposal. Dates arrive as "dd/mm/YYYY".
export interface ProposalBgv {
  vendor: string | null;
  status: "initiated" | "success" | "failed" | null;
  initiated_on: string | null;
  completed_on: string | null;
}

  export interface CreateProposalRequest {
    candidate_id: number;
    client_id: number;
    bill_rate_hourly: number;
    bill_rate_currency: string;
  }
  
  // One line of a proposal's history (who moved it, when, and why).
  export interface ProposalHistoryEntry {
    id: number;
    action: string;
    from_stage: string | null;
    to_stage: string;
    by: string;
    comment: string | null;
    at: string;
  }

export interface MoveProposalRequest {
  proposal_id: number;
  action:string;
  comment: string;
  // Only for "Start BGV".
  bgv_vendor?: string;
  bgv_initiated_on?: string;
  // Only for "Mark joined".
  joining_date?: string;
}


export interface EditProposalRequest {
  proposal_id: number;
  bill_rate_hourly: number;
  bill_rate_currency: string;
}
