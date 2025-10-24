import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinGroup: (inviteCode: string) => Promise<{ success: boolean; error?: string }>;
}

export function JoinGroupDialog({ open, onOpenChange, onJoinGroup }: JoinGroupDialogProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    if (inviteCode.trim().length !== 10) {
      setError('Invite code must be exactly 10 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await onJoinGroup(inviteCode.trim());

      if (!result.success && result.error) {
        setError(result.error);
      } else {
        setInviteCode('');
        onOpenChange(false);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError('');
      setInviteCode('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Group</DialogTitle>
          <DialogDescription>
            Enter the invite code shared by your group admin to join an existing group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                placeholder="e.g., ABCDEFGHJK"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                autoFocus
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                10-character code provided by the group creator
              </p>
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!inviteCode.trim() || loading}>
              {loading ? 'Joining...' : 'Join Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}