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

interface AddTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTrip: (trip: {
    startAddress: string;
    endAddress: string;
  }) => void;
}

export function AddTripDialog({ open, onOpenChange, onAddTrip }: AddTripDialogProps) {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startAddress.trim() || !endAddress.trim()) {
      setError('Please fill in both addresses');
      return;
    }

    onAddTrip({
      startAddress: startAddress.trim(),
      endAddress: endAddress.trim(),
    });

    // Reset form
    setStartAddress('');
    setEndAddress('');
    setError('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Trip</DialogTitle>
          <DialogDescription>
            Log a trip to track expenses for your group
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="start-address">Start Address</Label>
              <Input
                id="start-address"
                placeholder="e.g., 123 Main St, City"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-address">End Address</Label>
              <Input
                id="end-address"
                placeholder="e.g., 456 Oak Ave, City"
                value={endAddress}
                onChange={(e) => setEndAddress(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}