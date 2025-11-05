import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AddressInput } from "../ui/address-input";
import { Calculator, Plus, X } from "lucide-react"; // Import Plus and X icons
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

// Define the Stop type
interface Stop {
  id: number; // For React list key and easy removal
  display_name: string;
  place_id: string | null;
}

interface AddTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costPerDistance?: number;
  groupId: number;
  onTripCreated: () => void;
}

const initialStops: Stop[] = [
  { id: 1, display_name: "", place_id: null }, // Start Address
  { id: 2, display_name: "", place_id: null }, // End Address
];

export function AddTripDialog({
  open,
  onOpenChange,
  costPerDistance,
  groupId,
  onTripCreated,
}: AddTripDialogProps) {
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [stops, setStops] = useState<Stop[]>(initialStops);
  const [distance, setDistance] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const calculatedCost =
    distance !== null && costPerDistance ? distance * costPerDistance : null;

  const handleStopChange = (
    id: number,
    field: "display_name" | "place_id",
    value: string | null
  ) => {
    setStops((prevStops) =>
      prevStops.map((stop) =>
        stop.id === id
          ? { ...stop, [field]: value === null ? null : value }
          : stop
      )
    );
    setDistance(null);
  };

  const handleAddStop = (index: number) => {
    const newStop: Stop = {
      id: Date.now(), // Use a unique ID (timestamp is simple)
      display_name: "",
      place_id: null,
    };
    setStops((prevStops) => {
      const newStops = [...prevStops];
      newStops.splice(index, 0, newStop);
      return newStops;
    });
    setDistance(null);
  };

  const handleRemoveStop = (id: number) => {
    setStops((prevStops) => prevStops.filter((stop) => stop.id !== id));
    setDistance(null);
  };

  const handleCalculateDistance = async () => {
    const placeIds = stops
      .map((stop) => stop.place_id)
      .filter((id): id is string => id !== null);

    if (placeIds.length < 2) {
      setCalculationError(
        "Please select a start and end address from the dropdown suggestions"
      );
      return;
    }

    const hasUnselectedStop = stops.some((stop) => stop.place_id === null);
    if (hasUnselectedStop) {
      setCalculationError(
        "Please ensure all addresses are selected from the dropdown suggestions"
      );
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const calculatedDistance = await mapsService.calculateDistance(placeIds);
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
    const placeIdsValid = stops.every((stop) => stop.place_id !== null);

    if (
      !tripName.trim() ||
      distance === null ||
      calculatedCost === null ||
      !placeIdsValid ||
      !costPerDistance
    ) {
      setCreationError(
        "Please ensure all required fields are filled and the cost is calculated."
      );
      return;
    }
    setIsCreatingTrip(true);
    setCreationError(null);

    try {
      const tripStops = stops.map((stop) => ({
        place_id: stop.place_id as string, // We checked for null above
        display_name: stop.display_name,
      }));

      const tripData: CreateTripRequest = {
        group_id: groupId,
        name: tripName.trim(),
        description: description.trim() || undefined,
        stops: tripStops,
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
      setStops(initialStops); // Reset to initial two stops
      setDistance(null);
      setCalculationError(null);
      setIsCalculating(false);
      setCreationError(null);
      setIsCreatingTrip(false);
    }
    onOpenChange(open);
  };

  // Determine if calculation is globally disabled
  const isCalculationDisabled =
    stops.some((stop) => !stop.place_id) || isCalculating || stops.length < 2;

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
            <Label>Trip Stops</Label>
            {stops.map((stop, index) => {
              const isStart = index === 0;
              const isEnd = index === stops.length - 1;
              const isIntermediate = !isStart && !isEnd;

              return (
                <div key={stop.id} className="flex items-center gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <Label className="text-sm font-normal">
                      {isStart
                        ? "Start Address"
                        : isEnd
                        ? "End Address"
                        : `Stop ${index}`}
                    </Label>
                    <AddressInput
                      id={`stop-address-${stop.id}`}
                      placeholder={
                        isStart
                          ? "Start address"
                          : isEnd
                          ? "End address"
                          : `Stop ${index} address`
                      }
                      value={stop.display_name}
                      onChange={(value) =>
                        handleStopChange(stop.id, "display_name", value)
                      }
                      onPlaceIdChange={(value) =>
                        handleStopChange(stop.id, "place_id", value)
                      }
                      className="max-w-full"
                    />
                  </div>
                  {/* Remove button for intermediate stops */}
                  {isIntermediate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveStop(stop.id)}
                      className="mt-6 flex-shrink-0" // Align with the input
                      title={`Remove stop ${index}`}
                    >
                      <X className="size-4 text-red-500" />
                    </Button>
                  )}
                </div>
              );
            })}

            {/* Add Stop Button - placed before the last stop (End Address) */}
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddStop(stops.length - 1)}
                className="w-full justify-start text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Plus className="size-4 mr-2" />
                Add Intermediate Stop
              </Button>
            </div>
          </div>

          {/* Calculate */}
          <Button
            type="button"
            variant="outline"
            onClick={handleCalculateDistance}
            disabled={isCalculationDisabled}
            className="max-w-full mt-2"
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
