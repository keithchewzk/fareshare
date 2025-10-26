from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel


class Stop(BaseModel):
    """Schema for a trip stop/waypoint."""

    place_id: str
    display_name: str


class CreateTrip(BaseModel):
    """Schema for creating a new trip."""

    group_id: int
    name: str
    description: Optional[str] = None
    stops: List[Stop]
    total_distance: float
    cost_per_distance: Decimal
    total_cost: Decimal


class Trip(CreateTrip):
    """Schema for basic trip response data."""

    id: int
    user_id: int
    created_at: datetime
    settled_at: Optional[datetime] = None


class TripDetails(Trip):
    """Schema for detailed trip response with user information."""

    user_first_name: str
    user_last_name: str
    user_email: str
