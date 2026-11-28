import type { CurrentStatus } from "@/types/lifecycle";

export interface CreateCandidateRequest {
  name: string;
  email: string;
  phone: string;
  location: string;
  primary_skill: string;
  experience_years: number;
  experience_months: number;
  skills: string[] ;
  current_ctc_amount: number;  
  expected_ctc_amount: number;
  current_ctc_currency: string;
  expected_ctc_currency: string;
  notice_days: number;
  source: string;
  status: string;
  availability: string;
  last_contacted_on: string | null;
  recruiter_notes: string;
  pan?: string;
  aadhaar?: string;
}

export interface CandidateIdentity {
  pan: string | null; // "XXXXX1234F"
  aadhaar: string | null; // "XXXX XXXX 1234"
  pan_on_file: boolean;
  aadhaar_on_file: boolean;
  missing: IdentityField[]; // still needed before the offer
  can_set: boolean; // this user may enter what is missing (the sysadmin may also correct)
}

export interface SetIdentityRequest {
  candidate_id: number;
  pan?: string;
  aadhaar?: string;
}

export interface Candidate {
  id: number;
  company: string;
  name: string | null;
  email: string;
  phone: string;
  primary_skill: string;
  skills: string[] | string | null;
  experience_years: number | null;
  experience_months: number | null;
  location: string | null;
  current_ctc_amount: string | null;
  current_ctc_currency: string | null;
  expected_ctc_amount: string | null;
  expected_ctc_currency: string | null;
  notice_days: number | null;
  source: string | null;
  status: string | null;
  owner: string | null;
  created_on: string;
  last_contacted_on: string | null;
  availability: string | null;
  cv_url: string | null;
  recruiter_notes: string | null;
  can_edit:boolean;
  can_delete:boolean;
  can_propose: boolean;
  // Why new proposals are blocked (a non-performance exit), or null. can_unblock: this user (sysadmin, MD) may lift it.
  proposal_block: string | null;
  can_unblock: boolean;
  proposals: CandidateProposal[];
  current: CurrentStatus;
  identity: CandidateIdentity;
}

export interface CandidateProposal {
  id:number,
  client: string,
  stage: string,
  is_open: boolean,

}

export type IdentityField = "PAN" | "Aadhaar";

export type EditCandidateRequest = Omit<CreateCandidateRequest, "pan" | "aadhaar"> & {candidate_id: number};