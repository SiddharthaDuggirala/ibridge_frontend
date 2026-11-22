import { ArrowRightLeft } from "lucide-react";
import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {  useTransferOwnershipMutation } from "@/store/team-api";
import type { TeamMember, TransferOwnershipResult } from "@/types/team";

// Hand everything one person owns to a colleague with the same role, and optionally deactivate them.

export function TransferDialog({member,team}: {member:TeamMember, team: TeamMember[]}) {
    
    const [open, setOpen] = useState(false); 
    const [toUserId, setToUserId] = useState("");
    const [deactivate, setDeactivate] = useState(true);
   const [result, setResult] = useState<TransferOwnershipResult | null>(null);
   const [transferOwnership, { isLoading, error }] = useTransferOwnershipMutation();

   const colleagues = team.filter((other) => other.id !== member.id && other.is_active
   && other.role.shortcode === member.role.shortcode );

   function handleOpenChange(nextOpen:boolean) {
        if(nextOpen){
            setToUserId("");
            setDeactivate(true);
            setResult(null);
        }
        setOpen(nextOpen);
   }
   async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const moved = await transferOwnership({
        from_user_id: member.id,
        to_user_id: Number(toUserId),
        deactivate,
      }).unwrap();
      setResult(moved); // show what happened instead of closing straight away
    } catch {
      // Keep the dialog open; the message shows from `error`.
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          {/* Hidden once deactivated, but the dialog stays mounted so its result stays on screen after the list refreshes. */}
          {member.is_active ? (
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowRightLeft className="size-4" /> Transfer
              </Button>
            </DialogTrigger>
          ) : null}
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Hand over {member.name}'s work</DialogTitle>
              <DialogDescription>
                Their candidates and proposals move to the colleague you pick. The approval history keeps the real names.
              </DialogDescription>
            </DialogHeader>
    
            {result ? (
              <div className="space-y-4">
                <p className="text-sm">
                  Moved <span className="font-medium">{result.candidates_moved}</span> candidate(s) and{" "}
                  <span className="font-medium">{result.proposals_moved}</span> proposal(s).
                  {result.deactivated ? ` ${member.name} is deactivated and logged out.` : ""}
                </p>
                <DialogFooter>
                  <Button onClick={() => setOpen(false)}>Done</Button>
                </DialogFooter>
              </div>
            ) : colleagues.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  There is no other active {member.role.name} to take over. Add one first.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`to-${member.id}`}>Hand over to</Label>
                  <Select value={toUserId} onValueChange={setToUserId}>
                    <SelectTrigger id={`to-${member.id}`} className="w-full">
                      <SelectValue placeholder={`Choose a ${member.role.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {colleagues.map((other) => (
                        <SelectItem key={other.id} value={String(other.id)}>
                          {other.name} ({other.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
    
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`deactivate-${member.id}`}
                    checked={deactivate}
                    onCheckedChange={(checked) => setDeactivate(checked === true)}
                  />
                  <Label htmlFor={`deactivate-${member.id}`}>Also deactivate {member.name} (they are leaving)</Label>
                </div>
    
                {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant={deactivate ? "destructive" : "default"} disabled={isLoading || !toUserId}>
                    {isLoading ? "Moving…" : deactivate ? "Transfer & deactivate" : "Transfer"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      );
}


