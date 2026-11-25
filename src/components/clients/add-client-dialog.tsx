import { Pencil, Plus } from "lucide-react";
import { useState, type SubmitEvent } from "react";

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
import { Switch } from "@/components/ui/switch";
import { useCreateClientMutation, useEditClientMutation } from "@/store/clients-api";
import type { Client, CreateClientRequest } from "@/types/client";

// The form holds the text fields plus the active switch (only shown when editing).
type ClientForm = CreateClientRequest & { is_active: boolean };

const EMPTY_FORM: ClientForm = { name: "", industry: "", country: "", currency: "USD", is_active: true };

function toForm(client: Client): ClientForm {
  return {
    name: client.name ?? "",
    industry: client.industry ?? "",
    country: client.country ?? "",
    currency: client.currency ?? "USD",
    is_active: client.is_active,
  };
}

// System admin only. Without `client` it adds a new one; with `client` it edits that one.
export function ClientFormDialog({ client }: { client?: Client }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClientForm>(EMPTY_FORM);
  const [createClient, createState] = useCreateClientMutation();
  const [editClient, editState] = useEditClientMutation();

  const isLoading = createState.isLoading || editState.isLoading;
  const error = client ? editState.error : createState.error;

  // Start from the client's current details (or empty) every time, with no old error message.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setForm(client ? toForm(client) : EMPTY_FORM);
      createState.reset();
      editState.reset();
    }
    setOpen(nextOpen);
  }

  // Change one text field, keep the rest.
  function update(field: keyof CreateClientRequest, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // Trim spaces so " Globex " and "Globex" are the same name.
    const details: CreateClientRequest = {
      name: form.name.trim(),
      industry: form.industry.trim(),
      country: form.country.trim(),
      currency: form.currency.trim().toUpperCase(),
    };
    try {
      if (client) {
        await editClient({ client_id: client.id, is_active: form.is_active, ...details }).unwrap();
      } else {
        await createClient(details).unwrap();
      }
      setOpen(false); // the Clients list refreshes by itself (tag "Client")
    } catch {
      // Keep the dialog open; Django's message shows from `error`.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {client ? (
          <Button variant="ghost" size="icon" aria-label={`Edit ${client.name ?? "client"}`} title="Edit client">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Add client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "Add client"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Changes apply straight away. Existing proposals keep their own bill rate and currency."
              : "Once added, Leads can propose candidates to this client."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client name</Label>
            <Input id="client-name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="client-industry">Industry</Label>
              <Input
                id="client-industry"
                placeholder="e.g. Banking"
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-country">Country</Label>
              <Input
                id="client-country"
                placeholder="e.g. India"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-currency">Currency</Label>
            <Input
              id="client-currency"
              className="w-24"
              minLength={3}
              maxLength={3}
              pattern="[A-Za-z]{3}"
              title="A 3-letter code, like USD or INR"
              value={form.currency}
              onChange={(e) => update("currency", e.target.value.toUpperCase())}
              required
            />
            <p className="text-xs text-muted-foreground">
              A 3-letter code (USD, INR, GBP). It becomes the default bill rate currency when a Lead proposes a candidate.
            </p>
          </div>

          {/* New clients always start active, so the switch only appears when editing. */}
          {client ? (
            <div className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label htmlFor="client-active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  An inactive client stays in the records but Leads can no longer propose candidates to it.
                </p>
              </div>
              <Switch
                id="client-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : client ? "Save changes" : "Add client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}