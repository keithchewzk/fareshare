from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime


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
    """Schema for trip response data."""
    id: int
    created_by: int
    created_at: datetime