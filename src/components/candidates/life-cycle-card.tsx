import { format } from "date-fns";
import { Coffee } from "lucide-react";

import { CurrentStatusBadge } from "@/components/candidates/current-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useGetLifecycleQuery } from "@/store/lifecycle-api";
import type { BenchPeriod, LifecycleClient, LifecycleEvent } from "@/types/lifecycle";
import { parseDjangoDateTime } from "@/utils/dates";

// "01/10/2026" -> "1 Oct 2026"
function readableDate(value: string): string {
  const date = parseDjangoDateTime(value);
  return date ? format(date, "d MMM yyyy") : value;
}

// A date still to come, e.g. a last working day next month.
function isFuture(value: string): boolean {
  const date = parseDjangoDateTime(value);
  return date !== null && date.getTime() > Date.now();
}

// A candidate's whole story to date: where they are now, then client by client.
export function LifeCycleCard({ candidateId }: { candidateId: number }) {
    const { data: lifecycle, error, isLoading } = useGetLifecycleQuery({ candidate_id: candidateId });
  
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Life cycle</CardTitle>
          {lifecycle ? <CurrentStatusBadge status={lifecycle.current} /> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading life cycle…</p> : null}
          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
          {lifecycle ? (
            <>
              {lifecycle.added_on ? (
                <p className="text-sm text-muted-foreground">Added on {readableDate(lifecycle.added_on)}</p>
              ) : null}
              {lifecycle.clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No client steps to show yet.</p>
              ) : (
                lifecycle.clients.map((client, index) => (
                  <ClientStory
                    key={client.proposal_id}
                    client={client}
                    // Only the latest client starts open; older ones can be opened with a click.
                    startOpen={index === lifecycle.clients.length - 1}
                  />
                ))
              )}
            </>
          ) : null}
        </CardContent>
      </Card>
    );
  }

// One client: a line to click, its steps, and the bench after it.
function ClientStory({ client, startOpen }: { client: LifecycleClient; startOpen: boolean }) {
    const latest = client.events.at(-1);
    return (
      <div className="space-y-3">
        <details open={startOpen} className="rounded-md border border-border p-3">
          <summary className="cursor-pointer text-sm">
            <span className="font-medium">{client.client}</span>
            <span className="text-muted-foreground">
              {" "}
              · {client.is_open ? "Running" : "Ended"}
              {latest ? ` · ${latest.label}, ${readableDate(latest.on)}` : ""}
            </span>
          </summary>
          <ol className="mt-3 space-y-3 border-l border-border pl-4">
            {client.events.map((event) => (
              <EventRow key={event.key} event={event} />
            ))}
          </ol>
        </details>
        {client.bench ? <BenchRow bench={client.bench} /> : null}
      </div>
    );
  }

// One step: a dot on the line, what happened and when, and (for those who may see it) who and why.
function EventRow({ event }: { event: LifecycleEvent }) {
    const future = isFuture(event.on);
    return (
      <li className="relative text-sm">
        <span
          className={cn(
            "absolute -left-[1.3rem] top-1.5 size-2 rounded-full ring-2 ring-background",
            future ? "bg-muted-foreground/40" : "bg-primary",
          )}
        />
        <p className={cn(future && "text-muted-foreground")}>
          <span className="font-medium">{event.label}</span>
          <span className="text-muted-foreground"> · {readableDate(event.on)}</span>
          {event.by ? <span className="text-muted-foreground"> · {event.by}</span> : null}
        </p>
        {event.comment ? <p className="text-muted-foreground">“{event.comment}”</p> : null}
      </li>
    );
  }
  
  // The time between two clients.
  function BenchRow({ bench }: { bench: BenchPeriod }) {
    return (
      <p className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <Coffee className="size-4 shrink-0" />
        <span>
          <span className="font-medium">On the bench</span> from {readableDate(bench.from)}
          {bench.to ? ` to ${readableDate(bench.to)}` : ""} · {bench.days} day{bench.days === 1 ? "" : "s"}
        </span>
      </p>
    );
  }