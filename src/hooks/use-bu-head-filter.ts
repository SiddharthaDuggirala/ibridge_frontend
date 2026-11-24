import { useState } from "react";

import type { PersonRef } from "@/types/team";

// A "filter by BU Head" for any list whose rows carry a bu_head (proposals, onboarding cases, ...).
// Returns the BU Heads present in the list, the current choice, a setter, and the rows to show.
export function useBuHeadFilter<T extends { bu_head: PersonRef | null }>(rows: T[]) {
  // "all", or one BU Head's id as text (Select values are always strings).
  const [buHeadFilter, setBuHeadFilter] = useState("all");

  // Every BU Head that appears in the list, once each (a Map keeps one entry per id), sorted by name.
  const buHeadsById = new Map<number, PersonRef>();
  for (const row of rows) {
    if (row.bu_head) buHeadsById.set(row.bu_head.id, row.bu_head);
  }
  const buHeads = [...buHeadsById.values()].sort((a, b) => a.name.localeCompare(b.name));

  const shown = buHeadFilter === "all" ? rows : rows.filter((row) => String(row.bu_head?.id) === buHeadFilter);

  return { buHeads, buHeadFilter, setBuHeadFilter, shown };
}
