import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calculator } from 'lucide-react';
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
  costPerDistance?: number;
  distanceUnit?: 'km' | 'mi';
}

export function AddTripDialog({ open, onOpenChange, costPerDistance, distanceUnit }: AddTripDialogProps) {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');

  // TODO: Will be implemented when backend is ready
  // const [distance, setDistance] = useState<number | null>(null);
  // const handleCalculateDistance = async () => { ... };
  // const handleSubmit = (e: React.FormEvent) => { ... };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStartAddress('');
      setEndAddress('');
    }
    onOpenChange(open);
  };

  // TODO: Will be used when backend is implemented
  // const calculatedCost = distance !== null ? distance * costPerDistance : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Trip</DialogTitle>
          <DialogDescription>
            Log a trip to track expenses for your group
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4 py-4">
            {/* Cost per distance info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Cost per {distanceUnit || 'km'} for this group: <span className="font-medium">${Number(costPerDistance || 0).toFixed(2)}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-address">Start Address</Label>
              <Input
                id="start-address"
                placeholder="e.g., 123 Main St, City, State"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-address">End Address</Label>
              <Input
                id="end-address"
                placeholder="e.g., 456 Oak Ave, City, State"
                value={endAddress}
                onChange={(e) => setEndAddress(e.target.value)}
              />
            </div>

            {/* Calculate Distance Button - Non-functional for now */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={true}
            >
              <Calculator className="size-4 mr-2" />
              Calculate Distance (Coming Soon)
            </Button>

            {/* Distance Display - Static for now */}
            <div className="space-y-2">
              <Label>Distance</Label>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Will be calculated automatically</p>
              </div>
            </div>

            {/* Total Cost Display - Static for now */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Trip Cost</p>
              <p className="text-sm text-muted-foreground">Will be calculated after distance</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            {/* Add Trip Button - Non-functional for now */}
            <Button type="button" disabled={true}>
              Add Trip (Coming Soon)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}