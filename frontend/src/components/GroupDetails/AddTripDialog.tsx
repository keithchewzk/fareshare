import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AddressInput } from '../ui/address-input';
import { Calculator } from 'lucide-react';
import { mapsService } from '../../services/mapsService';
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
}

export function AddTripDialog({ open, onOpenChange, costPerDistance }: AddTripDialogProps) {
  const [tripName, setTripName] = useState('');
  const [description, setDescription] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startPlaceId, setStartPlaceId] = useState<string | null>(null);
  const [endPlaceId, setEndPlaceId] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const handleCalculateDistance = async () => {
    if (!startPlaceId || !endPlaceId) {
      setCalculationError('Please select addresses from the dropdown suggestions');
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const calculatedDistance = await mapsService.calculateDistance([startPlaceId, endPlaceId]);
      setDistance(calculatedDistance);
    } catch (error) {
      console.error('Distance calculation failed:', error);
      setCalculationError(error instanceof Error ? error.message : 'Failed to calculate distance');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTripName('');
      setDescription('');
      setStartAddress('');
      setEndAddress('');
      setStartPlaceId(null);
      setEndPlaceId(null);
      setDistance(null);
      setCalculationError(null);
      setIsCalculating(false);
    }
    onOpenChange(open);
  };

  const calculatedCost = distance !== null && costPerDistance ? distance * costPerDistance : null;

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
                Cost per km for this group: <span className="font-medium">${Number(costPerDistance || 0).toFixed(2)}</span>
              </p>
            </div>

            {/* Trip Name */}
            <div className="space-y-2">
              <Label htmlFor="trip-name">Trip Name</Label>
              <Input
                id="trip-name"
                placeholder="e.g., Weekend Beach Trip"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Family outing to East Coast Park"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-address">Start Address</Label>
              <AddressInput
                id="start-address"
                placeholder="e.g., 123 Main St, Singapore"
                value={startAddress}
                onChange={setStartAddress}
                onPlaceIdChange={setStartPlaceId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-address">End Address</Label>
              <AddressInput
                id="end-address"
                placeholder="e.g., 456 Oak Ave, Singapore"
                value={endAddress}
                onChange={setEndAddress}
                onPlaceIdChange={setEndPlaceId}
              />
            </div>

            {/* Calculate Distance Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCalculateDistance}
              disabled={!startPlaceId || !endPlaceId || isCalculating}
            >
              <Calculator className="size-4 mr-2" />
              {isCalculating ? 'Calculating...' : 'Calculate Cost'}
            </Button>

            {/* Error Display */}
            {calculationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{calculationError}</p>
              </div>
            )}

            {/* Distance Display */}
            <div className="space-y-2">
              <Label>Distance</Label>
              <div className="bg-muted p-3 rounded-lg">
                {distance !== null ? (
                  <p className="text-sm font-medium">
                    {distance.toFixed(2)} km
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select addresses and click "Calculate Cost"
                  </p>
                )}
              </div>
            </div>

            {/* Total Cost Display */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Trip Cost</p>
              {calculatedCost !== null ? (
                <p className="text-2xl font-bold text-primary">
                  ${calculatedCost.toFixed(2)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Will be calculated after distance
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            {/* Add Trip Button */}
            <Button
              type="button"
              disabled={!tripName.trim() || distance === null || calculatedCost === null}
            >
              Add Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}