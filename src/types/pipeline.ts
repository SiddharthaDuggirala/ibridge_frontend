import type { PersonRef } from "@/types/team";


export interface PipelineColumn {
    key: string;
    label: string;
}

// Counts per column (keyed by column key), the total, and how many have waited too long.
export interface PipelineCounts {
    counts: Record<string, number>;
    stuck: number;
    total: number;
}

// One BU Head's row (bu_head is null for proposals made outside the hierarchy, e.g. by the system admin).
export interface PipelineRow extends PipelineCounts {
    bu_head: PersonRef | null;
  }
  
// Django's getpipeline answer: the MD's dashboard.
export interface Pipeline {
    columns: PipelineColumn[];
    rows: PipelineRow[];
    totals: PipelineCounts;
    stuck_after_days: number;
  }