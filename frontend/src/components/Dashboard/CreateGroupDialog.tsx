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
import { groupService, CreateGroupRequest } from '../../services/groupService';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: () => void;
}

export function CreateGroupDialog({ open, onOpenChange, onCreateGroup }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [costPerDistance, setCostPerDistance] = useState('0.50');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const groupData: CreateGroupRequest = {
        name: groupName.trim(),
        description: description.trim() || undefined,
        cost_per_distance: parseFloat(costPerDistance),
        distance_unit: distanceUnit,
      };

      await groupService.createGroup(groupData);

      // Reset form
      setGroupName('');
      setDescription('');
      setCostPerDistance('0.50');
      setDistanceUnit('km');

      // Close dialog and refresh groups
      onOpenChange(false);
      onCreateGroup();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group for your shared vehicle. You'll get an invite code to share with others.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g., Family Honda, Office Carpool"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of the group"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-per-distance">Cost per Distance</Label>
              <div className="flex gap-2">
                <Input
                  id="cost-per-distance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.50"
                  value={costPerDistance}
                  onChange={(e) => setCostPerDistance(e.target.value)}
                />
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value as 'km' | 'mi')}
                  className="px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="km">per km</option>
                  <option value="mi">per mile</option>
                </select>
              </div>
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!groupName.trim() || loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}