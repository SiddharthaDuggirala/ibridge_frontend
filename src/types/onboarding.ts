import type { PersonRef } from "@/types/team";

// One onboarding case from Django's getonboardings (created when the Lead marks a candidate joined).
// Dates arrive as "dd/mm/YYYY".
export interface Onboarding {
  id: number;
  proposal_id: number;
  candidate: { id: number; name: string | null; primary_skill: string; location: string | null };
  client: { id: number; name: string | null };
  lead: string;
  bu_head: PersonRef | null;
  stage: string; // "joined" (waiting for induction) or "inducted"
  joining_date: string | null;
  induction_date: string | null;
  allowed_actions: string[];
}

// One onboarding step, e.g. HR's "hr_induction_done" with the induction date ("YYYY-MM-DD").
export interface MoveOnboardingRequest {
  onboarding_id: number;
  action: string;
  induction_date: string;
  comment: string;
}
