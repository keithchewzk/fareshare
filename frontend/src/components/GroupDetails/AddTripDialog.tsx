import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AddressInput } from "../ui/address-input";
import { Calculator } from "lucide-react";
import { mapsService } from "../../services/mapsService";
import { tripService, CreateTripRequest } from "../../services/tripService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface AddTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costPerDistance?: number;
  groupId: number;
  onTripCreated: () => void;
}

export function AddTripDialog({
  open,
  onOpenChange,
  costPerDistance,
  groupId,
  onTripCreated,
}: AddTripDialogProps) {
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [startPlaceId, setStartPlaceId] = useState<string | null>(null);
  const [endPlaceId, setEndPlaceId] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const calculatedCost =
    distance !== null && costPerDistance ? distance * costPerDistance : null;

  const handleCalculateDistance = async () => {
    if (!startPlaceId || !endPlaceId) {
      setCalculationError(
        "Please select addresses from the dropdown suggestions"
      );
      return;
    }
    setIsCalculating(true);
    setCalculationError(null);

    try {
      const calculatedDistance = await mapsService.calculateDistance([
        startPlaceId,
        endPlaceId,
      ]);
      setDistance(calculatedDistance);
    } catch (error) {
      console.error("Distance calculation failed:", error);
      setCalculationError(
        error instanceof Error ? error.message : "Failed to calculate distance"
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAddTrip = async () => {
    if (
      !tripName.trim() ||
      distance === null ||
      calculatedCost === null ||
      !startPlaceId ||
      !endPlaceId ||
      !costPerDistance
    ) {
      return;
    }
    setIsCreatingTrip(true);
    setCreationError(null);

    try {
      const tripData: CreateTripRequest = {
        group_id: groupId,
        name: tripName.trim(),
        description: description.trim() || undefined,
        stops: [
          { place_id: startPlaceId, display_name: startAddress },
          { place_id: endPlaceId, display_name: endAddress },
        ],
        total_distance: distance,
        cost_per_distance: costPerDistance,
        total_cost: calculatedCost,
      };

      await tripService.createTrip(tripData);

      handleOpenChange(false);
      onTripCreated();
    } catch (error) {
      console.error("Trip creation failed:", error);
      setCreationError(
        error instanceof Error ? error.message : "Failed to create trip"
      );
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTripName("");
      setDescription("");
      setStartAddress("");
      setEndAddress("");
      setStartPlaceId(null);
      setEndPlaceId(null);
      setDistance(null);
      setCalculationError(null);
      setIsCalculating(false);
      setCreationError(null);
      setIsCreatingTrip(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-full sm:max-w-[90%] md:max-w-md max-h-[90vh] flex flex-col overflow-hidden px-4 py-4 sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>Add New Trip</DialogTitle>
          <DialogDescription>
            Log a trip to track expenses for your group
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
          {/* Cost per km */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Cost per km for this group:{" "}
              <span className="font-medium">
                ${Number(costPerDistance || 0).toFixed(2)}
              </span>
            </p>
          </div>

          {/* Trip Name */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="trip-name">Trip Name</Label>
            <Input
              id="trip-name"
              placeholder="e.g., Weekend Beach Trip"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              autoFocus
              className="max-w-full"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Family outing to East Coast Park"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="max-w-full"
            />
          </div>

          {/* Addresses */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="start-address">Start Address</Label>
            <AddressInput
              id="start-address"
              placeholder="e.g., 123 Main St, Singapore"
              value={startAddress}
              onChange={setStartAddress}
              onPlaceIdChange={setStartPlaceId}
              className="max-w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="end-address">End Address</Label>
            <AddressInput
              id="end-address"
              placeholder="e.g., 456 Oak Ave, Singapore"
              value={endAddress}
              onChange={setEndAddress}
              onPlaceIdChange={setEndPlaceId}
              className="max-w-full"
            />
          </div>

          {/* Calculate */}
          <Button
            type="button"
            variant="outline"
            onClick={handleCalculateDistance}
            disabled={!startPlaceId || !endPlaceId || isCalculating}
            className="max-w-full"
          >
            <Calculator className="size-4 mr-2" />
            {isCalculating ? "Calculating..." : "Calculate Cost"}
          </Button>

          {/* Errors */}
          {calculationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-full">
              <p className="text-sm text-red-800">{calculationError}</p>
            </div>
          )}
          {creationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-full">
              <p className="text-sm text-red-800">{creationError}</p>
            </div>
          )}

          {/* Distance */}
          <div className="flex flex-col gap-1">
            <Label>Distance</Label>
            <div className="bg-muted p-3 rounded-lg max-w-full">
              {distance !== null ? (
                <p className="text-sm font-medium">{distance.toFixed(2)} km</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select addresses and click "Calculate Cost"
                </p>
              )}
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-primary/10 p-4 rounded-lg max-w-full">
            <p className="text-sm text-muted-foreground mb-1">
              Total Trip Cost
            </p>
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

        <DialogFooter className="mt-2 flex-shrink-0 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAddTrip}
            disabled={
              !tripName.trim() ||
              distance === null ||
              calculatedCost === null ||
              isCreatingTrip
            }
            className="w-full sm:w-auto"
          >
            {isCreatingTrip ? "Creating Trip..." : "Add Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
