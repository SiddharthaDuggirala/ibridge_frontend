import { useState } from "react";

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
import { useMoveExitMutation } from "@/store/onboarding-api";
import type { MoveExitRequest } from "@/types/onboarding";

interface ExitConfirmButtonProps {
  label: string; // the button's text, and the dialog's title
  question: string; // what the user confirms
  request: MoveExitRequest; // what is sent to Django on "Confirm"
  variant?: "default" | "outline";
}

// A button that asks first: exit steps cannot be undone.
export function ExitConfirmButton({ label, question, request, variant = "default" }: ExitConfirmButtonProps) {
    const [open, setOpen] = useState(false);
    const [moveExit, { isLoading, error, reset }] = useMoveExitMutation();
  
    function handleOpenChange(nextOpen: boolean) {
      if (nextOpen) reset(); // no old error message
      setOpen(nextOpen);
    }
  
    async function handleConfirm() {
      try {
        await moveExit(request).unwrap();
        setOpen(false); // the progress bar refreshes by itself (tags)
      } catch {
        // Keep the dialog open; Django's message shows from `error`.
      }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" variant={variant}>
              {label}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{label}</DialogTitle>
              <DialogDescription>{question} This cannot be undone.</DialogDescription>
            </DialogHeader>
    
            {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? "Saving…" : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }