import type { PersonRef } from "@/types/team";

// How late an item is: "amber" = waited the limit or more, "red" = twice the limit or more.
export type AttentionLevel = "amber" | "red";

// Which screen the item is on, so the card can link to it.
export type AttentionPage = "proposals" | "onboarding" | "exits";

// One thing that has waited too long, e.g. "Waiting for MD approval" for 4 days.
export interface AttentionItem {
    key: string;
    page: AttentionPage;
    title: string;
    waiting_on: string; // "BU Head", "MD", "HR" or "Lead"
    candidate: PersonRef;
    client: PersonRef;
    proposal_id: number;
    level: AttentionLevel;
    days: number | null; // null for clearance items (the detail gives the last working day)
    limit: number | null;
    detail: string | null;
}

// Django's getattention answer. read_only is true for recruiters: they follow their team's items but cannot act.
export interface Attention {
    read_only: boolean;
    items: AttentionItem[];
}








