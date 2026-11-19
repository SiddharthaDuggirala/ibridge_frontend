export interface TalentPool {
    id: number;
    company: string;
    name: string;
    description: string | null;
    candidate_ids: number[] | null;
    created_at: string;
  }