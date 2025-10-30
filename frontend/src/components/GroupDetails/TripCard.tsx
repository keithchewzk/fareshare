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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-32">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">
                  {getUserName(trip)}
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(trip.created_at)}
                </span>
                {isSettled && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="size-3" />
                      Settled
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex items-start gap-2 mb-2">
                <h4 className="font-medium">{trip.name}</h4>
              </div>

              {trip.description && (
                <div className="text-sm text-muted-foreground mb-2">
                  {trip.description}
                </div>
              )}

              <div className="flex items-start gap-2 mb-1">
                <MapPin className="size-4 mt-1 text-muted-foreground flex-shrink-0" />
                <span>{trip.stops[0]?.display_name || "Start location"}</span>
              </div>
              <div className="flex items-start gap-2 pl-6">
                <span className="text-muted-foreground">→</span>
                <span>
                  {trip.stops[trip.stops.length - 1]?.display_name ||
                    "End location"}
                </span>
              </div>
            </div>

            <div className="text-right ml-4">
              <div className="flex items-center gap-1 mb-1">
                <span>${Number(trip.total_cost).toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {trip.total_distance.toFixed(1)} km
              </div>
            </div>
          </div>

          {!isSettled && trip.user_id === currentUserId && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClick}
              disabled={loading}
              className="absolute bottom-0 right-0"
            >
              <Check className="size-4 mr-2" />
              {loading ? "Settling..." : "Mark as Settled"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
