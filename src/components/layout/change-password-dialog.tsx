import {useState, type SubmitEvent} from "react";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";

import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import { useChangePasswordMutation } from "@/store/auth-api";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Opened from the user menu. The menu owns `open`, because a dialog inside a menu item would close with the menu.

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatch, setMismatch] = useState(false);
  // After a successful change: how many other devices Django signed out (null = not changed yet).
  const [signedOut, setSignedOut] = useState<number | null>(null);
  const [changePassword, { isLoading, error, reset }] = useChangePasswordMutation();

  // Start empty every time the dialog opens or closes.
  function handleOpenChange(nextOpen: boolean) {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMismatch(false);
    setSignedOut(null);
    reset();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // Checked here, not in Django: only the browser knows what was typed twice.
    if (newPassword !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    try {
      const result = await changePassword({ old_password: oldPassword, new_password: newPassword }).unwrap();
      setSignedOut(result.other_sessions_signed_out);
    } catch {
      // Keep the dialog open; the message shows from `error`.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            {signedOut === null
              ? "You stay signed in here. Any other devices will be signed out."
              : "Your password has been changed."}
          </DialogDescription>
        </DialogHeader>

        {signedOut !== null ? (
          <>
            <p className="text-sm text-muted-foreground">
              {signedOut === 0
                ? "You were not signed in anywhere else."
                : `Signed out of ${signedOut} other ${signedOut === 1 ? "device" : "devices"}.`}
            </p>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">Current password</Label>
              <Input
                id="old-password"
                type="password"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters, not all numbers, and not a common password.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {mismatch ? <p className="text-sm text-destructive">The two new passwords don't match.</p> : null}
            {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving…" : "Change password"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}