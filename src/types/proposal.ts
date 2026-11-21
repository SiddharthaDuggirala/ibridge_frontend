export interface Proposal {
    id: number;
    candidate: { id: number; name: string | null; primary_skill: string; location: string | null };
    client: { id: number; name: string | null };
    stage: string;
    proposed_by: string;
    created_on: string;
    can_edit: boolean;
    allowed_actions: string[];
    bill_rate_hourly?: number;
    bill_rate_currency?: string;
    gross_margin_amount?: number | null;
    gross_margin_percent?: number | null;
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
} 


export interface EditProposalRequest {
  proposal_id: number;
  bill_rate_hourly: number;
  bill_rate_currency: string;
}