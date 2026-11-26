// One recorded step, e.g. "Approved by the MD" for a candidate at a client.
export interface RecentActivity {
  id: number;
  label: string;
  candidate: { id: number; name: string | null };
  client: string | null;
  by: string;
  at: string; // "dd/mm/YYYY HH:MM"
}

export interface DashboardSummary {
  people: number;
  candidates: number;
  employees: number;
  pending_approvals: number;
  audit_entries: number;
  recent: RecentActivity[];
  }