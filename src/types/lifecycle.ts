// Where a candidate is now. "leaving" = exit recorded but not finished; "left" = resigned or laid off.
export type StatusKey = "available" | "in_process" | "working" | "leaving" | "bench" | "left";

export interface CurrentStatus {
  key: StatusKey;
  label: string; // ready to show, e.g. "Working at Globex"
  client: string | null;
  since: string | null; // "dd/mm/YYYY"
  days: number | null;
}

// One step of the story, e.g. "Joined". by and comment are always null for recruiters and HR.
export interface LifecycleEvent {
  key: string;
  action: string;
  label: string;
  on: string; // "dd/mm/YYYY"
  by: string | null;
  comment: string | null;
}

// The time on the bench after a placement. to is null while they are still there.
export interface BenchPeriod {
  from: string;
  to: string | null;
  days: number;
}

export interface LifecycleClient {
  proposal_id: number;
  client: string;
  is_open: boolean;
  events: LifecycleEvent[];
  bench: BenchPeriod | null;
}

// One candidate's whole story, oldest client first.
export interface Lifecycle {
  added_on: string | null;
  current: CurrentStatus;
  clients: LifecycleClient[];
}