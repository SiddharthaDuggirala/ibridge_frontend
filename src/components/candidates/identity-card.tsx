import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSetCandidateIdentityMutation } from "@/store/candidates-api";
import type { Candidate } from "@/types/candidate";

// PAN and Aadhaar on the candidate page. Django decides what each role sees: the masked values
// (sysadmin, Lead, HR) or only whether they are on file. can_set: this user may enter what is missing.
export function IdentityCard({ candidate }: { candidate: Candidate }) {
    const { identity } = candidate;
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>PAN &amp; Aadhaar</CardTitle>
          {identity.can_set ? <IdentityDialog candidate={candidate} /> : null}
        </CardHeader>
        <CardContent>
          <IdentityRow label="PAN" shown={identity.pan} onFile={identity.pan_on_file} />
          <IdentityRow label="Aadhaar" shown={identity.aadhaar} onFile={identity.aadhaar_on_file} />
          {identity.missing.length > 0 ? (
            <p className="pt-2 text-xs text-muted-foreground">Both are needed before HR can release the offer.</p>
          ) : null}
        </CardContent>
      </Card>
    );
  }
  
  // shown: the masked value, or null when this role may not see it (then only "On file").
  function IdentityRow({ label, shown, onFile }: { label: string; shown: string | null; onFile: boolean }) {
    return (
      <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
        <span className="text-muted-foreground">{label}</span>
        {onFile ? (
          <span className="text-right font-medium tabular-nums">{shown ?? "On file"}</span>
        ) : (
          <span className="text-right font-medium text-destructive">Missing</span>
        )}
      </div>
    );
  }

  function IdentityDialog({ candidate }: { candidate: Candidate }) {
    const { identity } = candidate;
    const [open, setOpen] = useState(false);
    const [pan, setPan] = useState("");
    const [aadhaar, setAadhaar] = useState("");
    const [save, { isLoading, error, reset }] = useSetCandidateIdentityMutation();
  
    // Only the sysadmin may correct a value already on file; everyone else only fills in what is missing.
    const askPan = identity.missing.includes("PAN") || identity.missing.length === 0;
    const askAadhaar = identity.missing.includes("Aadhaar") || identity.missing.length === 0;
    const title = identity.missing.length === 0 ? "Correct PAN / Aadhaar" : `Add ${identity.missing.join(" and ")}`;
  
    function handleOpenChange(nextOpen: boolean) {
      if (nextOpen) {
        setPan("");
        setAadhaar("");
        reset(); // no old error message
      }
      setOpen(nextOpen);
    }
  
    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
      try {
        // Empty fields are left out (undefined), so Django changes only what was typed.
        await save({ candidate_id: candidate.id, pan: pan.trim() || undefined, aadhaar: aadhaar.trim() || undefined }).unwrap();
        setOpen(false); // the card and any proposal waiting for the offer refresh (tags)
      } catch {
        // Keep the dialog open; Django's message shows from `error`.
      }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              {identity.missing.length === 0 ? "Correct" : "Add"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                They identify {candidate.name ?? "this candidate"} if they ever come back. Only the last 4 Aadhaar digits are
                kept.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {askPan ? (
                <div className="space-y-2">
                  <Label htmlFor={`identity-pan-${candidate.id}`}>PAN</Label>
                  <Input
                    id={`identity-pan-${candidate.id}`}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    autoComplete="off"
                    className="uppercase"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                  />
                </div>
              ) : null}
              {askAadhaar ? (
                <div className="space-y-2">
                  <Label htmlFor={`identity-aadhaar-${candidate.id}`}>Aadhaar</Label>
                  <Input
                    id={`identity-aadhaar-${candidate.id}`}
                    placeholder="1234 5678 9012"
                    inputMode="numeric"
                    maxLength={14}
                    autoComplete="off"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                  />
                </div>
              ) : null}
    
              {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || (pan.trim() === "" && aadhaar.trim() === "")}>
                  {isLoading ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    }