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
  exit: Exit | null;
  exit_actions: string[];
}

// One onboarding step, e.g. HR's "hr_induction_done" with the induction date ("YYYY-MM-DD").
export interface MoveOnboardingRequest {
  onboarding_id: number;
  action: string;
  induction_date: string;
  comment: string;
}


// How the employee left. Dates arrive as "dd/mm/YYYY".
// stage: "clearance" (resigned, non-performance: items and letter pending) -> "relieved"; other reasons go straight to "exited".
export interface Exit {
  reason: ExitReason;
  reason_label: string;
  after_exit: AfterExit; // always "leave" except non-performance, where the Lead chose
  last_working_day: string;
  stage: "clearance" | "relieved" | "exited";
  items: ExitItem[]; // empty unless resigned or non-performance
  relieved_on: string | null;
  recorded_by: string | null;
  comment: string | null;
}

export interface ExitItem {
  key: string;
  label: string;
  done_on: string | null; // null = not returned / submitted yet
  by: string | null;
}

// One exit step. Each action carries its own fields, and TypeScript checks the right ones are there.
export type MoveExitRequest =
  | {
      onboarding_id: number;
      action: "record_exit";
      reason: ExitReason;
      after_exit?: AfterExit; // needed for non_performance only
      last_working_day: string;
      comment: string;
    }
  | { onboarding_id: number; action: "change_last_day"; last_working_day: string }
  | { onboarding_id: number; action: "clear_item"; item: string }
  | { onboarding_id: number; action: "release_relieving_letter" };


export type ExitReason = "resigned" | "project_completed" | "client_terminated" | "non_performance";

// After a non-performance exit: the person leaves the company, or stays and goes to the bench.
export type AfterExit = "leave" | "bench";