import { Ban, Send } from "lucide-react";
import { useState, type SubmitEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetClientsQuery } from "@/store/clients-api";
import { useCreateProposalMutation } from "@/store/proposals-api";
import type { Candidate } from "@/types/candidate";
import { money } from "@/utils/candidate-format";


// Client currency must be a 3-letter code for the proposal; anything else falls back to USD.
function currencyFor(clientCurrency: string | null): string {
    const code = (clientCurrency ?? "").trim().toUpperCase();
    return code.length === 3 ? code : "USD";
  }

// The Lead's "Propose to client": pick a client and an hourly bill rate.
export function ProposeDialog({ candidate }: { candidate: Candidate }) {
    const [open, setOpen] = useState(false);
    const [clientId, setClientId] = useState("");
    const [rate, setRate] = useState("");
    const [currency, setCurrency] = useState("USD");
  
    // skip: only load clients once the dialog is actually opened.
    const { data: clients, isLoading: clientsLoading } = useGetClientsQuery(undefined, { skip: !open });
    const [createProposal, { isLoading, error }] = useCreateProposalMutation();
  
    // Clients this candidate is already proposed to (Django refuses duplicates too).
    const alreadyProposed = candidate.proposals.filter((proposal) => proposal.is_open).map((proposal) => proposal.client);
  
    function handleClientChange(value: string) {
      setClientId(value);
      const client = clients?.find((c) => String(c.id) === value);
      setCurrency(currencyFor(client?.currency ?? null));
    }
  
    function handleOpenChange(nextOpen: boolean) {
      if (nextOpen) {
        setClientId("");
        setRate("");
        setCurrency("USD");
      }
      setOpen(nextOpen);
    }
  
    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
      try {
        await createProposal({
          candidate_id: candidate.id,
          client_id: Number(clientId),
          bill_rate_hourly: Number(rate),
          bill_rate_currency: currency,
        }).unwrap();
        setOpen(false); // the candidate list and its progress bar refresh by themselves (tags)
      } catch {
        // Keep the dialog open; the message shows from `error`.
      }
    }

    const name = candidate.name ?? "this candidate";

    // A non-performance exit blocks new proposals: show why instead of the button (Django refuses them too).
    // This comes after the hooks on purpose: React needs the same hooks called on every render.
    if (candidate.proposal_block) {
      return (
        <Badge variant="outline" className="gap-1 whitespace-nowrap text-muted-foreground" title={candidate.proposal_block}>
          <Ban className="size-3" /> Blocked
        </Badge>
      );
    }

      return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" title="Add client bill rate and send to BU Head">
              
              <Send className="size-4" /> Propose
            </Button>
          </DialogTrigger>
    
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Client bill rate for {name}</DialogTitle>
              <DialogDescription>
                Pick the client and the hourly bill rate. The proposal then goes to the BU Head.
              </DialogDescription>
            </DialogHeader>
    
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Expected CTC: <span className="font-medium text-foreground">{money(candidate.expected_ctc_amount)}</span>
              </p>
    
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={clientId} onValueChange={handleClientChange} required>
                  <SelectTrigger id="client" className="w-full">
                    <SelectValue placeholder={clientsLoading ? "Loading clients…" : "Choose a client"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(clients ?? []).filter((client) => client.is_active).map((client) => {
                      const taken = alreadyProposed.includes(client.name ?? "");
                      return (
                        <SelectItem key={client.id} value={String(client.id)} disabled={taken}>
                          {client.name ?? `Client ${client.id}`}
                          {taken ? " (already proposed)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
    
              <div className="grid grid-cols-[1fr_6rem] gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rate">Bill rate per hour</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    maxLength={3}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>
    
              <p className="text-xs text-muted-foreground">
                Gross margin is calculated automatically once the business sets the formula.
              </p>
    
              {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !clientId}>
                  {isLoading ? "Sending…" : "Send to BU Head"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    }