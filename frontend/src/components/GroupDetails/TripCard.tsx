import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MapPin, Check, CheckCircle2 } from "lucide-react";
import { TripDetails } from "../../services/tripService";

interface TripCardProps {
  trip: TripDetails;
  currentUserId: number;
  getUserName: (trip: TripDetails) => string;
  formatDate: (dateString: string) => string;
  onMarkAsSettled: (tripId: number) => Promise<void>;
}

export function TripCard({
  trip,
  currentUserId,
  getUserName,
  formatDate,
  onMarkAsSettled,
}: TripCardProps) {
  const [loading, setLoading] = useState(false);
  const isSettled = !!trip.settled_at;

  const handleClick = async () => {
    if (isSettled) return;
    setLoading(true);
    try {
      await onMarkAsSettled(trip.id);
    } catch (err) {
      console.error("Error marking trip as settled:", err);
    } finally {
      setLoading(false);
    }
  };

  const startStop = trip.stops[0];
  const endStop = trip.stops[trip.stops.length - 1];

  const intermediateStops = trip.stops.slice(1, trip.stops.length - 1);
  const hasIntermediateStops = intermediateStops.length > 0;

  return (
    <Card>
      <CardContent className="p-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Left content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                {getUserName(trip)}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(trip.created_at)}
              </span>
            </div>

            <div className="flex flex-col gap-2 mb-2">
              <h4 className="font-medium truncate">{trip.name}</h4>
            </div>

            {trip.description && (
              <div className="text-sm text-muted-foreground mb-2 truncate">
                {trip.description}
              </div>
            )}

            {/* --- Addresses Section --- */}

            {/* 1. Start Address */}
            <div className="flex items-start gap-2 mb-1">
              <MapPin className="size-4 mt-1 text-muted-foreground flex-shrink-0" />
              <span className="truncate font-medium">
                {startStop?.display_name || "Start location"}
              </span>
            </div>

            {/* Connector for the first segment (only show if there are stops after start) */}
            {trip.stops.length > 1 && (
              <div className="flex items-start gap-2 pl-6">
                <span className="text-muted-foreground text-xl leading-none">
                  ↓
                </span>
              </div>
            )}

            {/* 2. Intermediate Stops */}
            {hasIntermediateStops && (
              <div className="flex flex-col gap-1">
                {intermediateStops.map((stop, index) => (
                  <div key={index} className="pl-6 ml-1.5 py-1">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground flex-shrink-0 text-xs mt-1">
                        •
                      </span>
                      <span className="truncate text-sm">
                        {stop.display_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Connector for the final segment (only show if there are stops before end) */}
            {hasIntermediateStops && (
              <div className="flex items-start gap-2 pl-6">
                <span className="text-muted-foreground text-xl leading-none">
                  ↓
                </span>
              </div>
            )}

            {/* 3. End Address */}
            <div className="flex items-start gap-2 pt-1">
              <MapPin className="size-4 mt-1 text-muted-foreground flex-shrink-0" />
              <span className="truncate font-medium">
                {endStop?.display_name || "End location"}
              </span>
            </div>

            {/* --- End Addresses Section --- */}
          </div>

          {/* Right content (cost & distance) */}
          <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 text-right">
            <div className="flex flex-col items-end">
              <span className="font-medium">
                ${Number(trip.total_cost).toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                {trip.total_distance.toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        {/* Settled Badge / Mark as Settled Button */}
        <div className="absolute bottom-4 right-4">
          {isSettled ? (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-sm py-1 px-3"
            >
              <CheckCircle2 className="size-4" />
              Settled
            </Badge>
          ) : trip.user_id === currentUserId ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClick}
              disabled={loading}
            >
              <Check className="size-4 mr-2" />
              {loading ? "Settling..." : "Mark as Settled"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
