import { Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteCandidateMutation } from "@/store/candidates-api";

// A bin icon that asks "are you sure?" before deleting.
export function DeleteCandidateButton({
  id,
  name,
  onDeleted,
}: {
  id: number;
  name: string;
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleteCandidate, { isLoading, error }] = useDeleteCandidateMutation();

  async function handleDelete() {
    try {
      await deleteCandidate({ candidate_id: id }).unwrap();
      setOpen(false); // the list re-fetches by itself (tags)
      onDeleted?.();
    } catch {
      // Keep the box open; the message shows from `error`.
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Delete ${name}`}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the candidate from the database. It cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}