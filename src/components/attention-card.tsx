import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ROLES } from "@/constants/roles";
import { cn } from "@/lib/utils";
import { useGetAttentionQuery } from "@/store/attention-api";
import { getRole } from "@/store/token";
import type { AttentionItem, AttentionLevel } from "@/types/attention";


const FIRST_ROWS = 5;

// The dot colour for each level. Record<AttentionLevel, string> means: one entry for EVERY level, no more, no less.

const DOT_COLOUR: Record<AttentionLevel,string> = {
    amber: "bg-amber-500",
  red: "bg-red-600",
};

function daysText(days: number): string {
    return days === 1 ? "1 day" : `${days} days`;
  }

// "Needs your attention": the items that have waited too long (Django's getattention).
// roles: who sees the card on this page. It hides itself while loading, on an error, and when nothing is late.
export function AttentionCard({ roles }: { roles: string[] }) {
    const role = getRole();
    const allowed = role !== null && roles.includes(role);
    // skip: don't even ask Django when this person does not see the card here.
    const { data } = useGetAttentionQuery(undefined, { skip: !allowed });
    const [showAll, setShowAll] = useState(false);
  
    const items = data?.items ?? [];
    if (!allowed || items.length === 0) {
      return null;
    }
  
    // The system admin and recruiters see other people's items, so each row says who it is waiting on.
    const showWho = data?.read_only === true || role === ROLES.SYSADMIN || role === ROLES.MD;
    const visible = showAll ? items : items.slice(0, FIRST_ROWS);
    const redCount = items.filter((item) => item.level === "red").length;

    return (
        <Card className="border-amber-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-600" />
              {data?.read_only ? "Waiting on others in your team" : "Needs your attention"}
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {items.length} waiting{redCount > 0 ? `, ${redCount} overdue` : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {visible.map((item) => (
                <AttentionRow key={item.key} item={item} showWho={showWho} />
              ))}
            </ul>
            {items.length > FIRST_ROWS ? (
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show fewer" : `Show all ${items.length}`}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      );
    }
    
    function AttentionRow({ item, showWho }: { item: AttentionItem; showWho: boolean }) {
      const facts = [
        item.days !== null ? `waiting ${daysText(item.days)}` : null,
        showWho ? `with ${item.waiting_on}` : null,
        item.detail,
      ].filter(Boolean);
    
      return (
        <li className="flex items-start gap-3 py-2.5 text-sm">
          <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT_COLOUR[item.level])} />
          <div className="min-w-0 flex-1">
            <p>
              <span className="font-medium">{item.title}</span>
              <span className="text-muted-foreground"> · </span>
              <Link to={`/candidates/${item.candidate.id}`} className="hover:underline">
                {item.candidate.name}
              </Link>
              <span className="text-muted-foreground"> → {item.client.name}</span>
            </p>
            <p className="text-xs text-muted-foreground">{facts.join(" · ")}</p>
          </div>
          <Link to={`/${item.page}`} className="shrink-0 text-xs font-medium text-primary hover:underline">
            Open
          </Link>
        </li>
      );
    }