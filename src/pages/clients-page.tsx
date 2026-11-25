import { format } from "date-fns";
import { Search } from "lucide-react";
import { useState } from "react";

import { ClientFormDialog } from "@/components/clients/add-client-dialog";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLES } from "@/constants/roles";
import { useGetClientsQuery } from "@/store/clients-api";
import { getRole } from "@/store/token";
import { parseDjangoDateTime } from "@/utils/dates";

const COLUMN_COUNT = 6;


// "01/04/2025" -> "1 Apr 2025"; "—" when not known.
function sinceText(since: string | null): string {
    const date = since ? parseDjangoDateTime(since) : null;
    return date ? format(date, "d MMM yyyy") : "—";
  }
  
  // Every client. The system admin can add new ones.
  export function ClientsPage() {
    const { data, error, isLoading, isFetching, refetch } = useGetClientsQuery();
    const clients = data ?? [];
    const [search, setSearch] = useState("");
    const canAdd = getRole() === ROLES.SYSADMIN;
  
    // Search: name, industry or country (ignores upper/lower case). Sorted A to Z.
    const term = search.trim().toLowerCase();
    const shown = clients
      .filter((client) => !term || [client.name, client.industry, client.country].join(" ").toLowerCase().includes(term))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

      return (
        <>
          <PageHeader
            title="Clients"
            description="The companies we propose candidates to."
            actions={canAdd ? <ClientFormDialog /> : undefined}
          />
    
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search by name, industry or country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search clients"
              />
            </div>
            <RefreshButton onRefresh={refetch} isFetching={isFetching} />
          </div>
    
          <Card>
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Client</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Client since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <MessageRow text="Loading clients…" />
                ) : error ? (
                  <MessageRow text={error.message ?? "Could not load clients."} isError />
                ) : shown.length === 0 ? (
                  <MessageRow text={clients.length === 0 ? "No clients yet." : "No clients match your search."} />
                ) : (
                  shown.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="px-4">
                        <p className="font-medium">{client.name ?? `Client ${client.id}`}</p>
                        {client.industry ? <p className="text-xs text-muted-foreground">{client.industry}</p> : null}
                      </TableCell>
                      <TableCell>{client.country ?? "—"}</TableCell>
                      <TableCell>{client.currency ?? "—"}</TableCell>
                      <TableCell>{sinceText(client.since)}</TableCell>
                      <TableCell>
                        {client.is_active ? <Badge variant="secondary">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                      </TableCell>
                      <TableCell>{canAdd ? <ClientFormDialog client={client} /> : null}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      );
    }
    
    // One full-width row for loading / error / empty messages.
    function MessageRow({ text, isError = false }: { text: string; isError?: boolean }) {
      return (
        <TableRow>
          <TableCell
            colSpan={COLUMN_COUNT}
            className={isError ? "py-12 text-center text-destructive" : "py-12 text-center text-muted-foreground"}
          >
            {text}
          </TableCell>
        </TableRow>
      );
    }