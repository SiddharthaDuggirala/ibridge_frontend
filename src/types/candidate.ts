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
  proposals: CandidateProposal[];
  current: CurrentStatus;
}

export interface CandidateProposal {
  id:number,
  client: string,
  stage: string,
  is_open: boolean,

}

export type EditCandidateRequest = CreateCandidateRequest & {candidate_id: number};