from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from src.trips.dependencies import get_trip_service
from src.trips.schemas import CreateTrip, Trip, TripDetails
from src.trips.service import TripService
from src.users.dependencies import get_current_user
from src.users.models import User

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.get("/", response_model=List[TripDetails])
async def get_trips(
    group_id: Optional[int] = Query(None, description="Filter trips by group ID"),
    current_user: User = Depends(get_current_user),
    trip_service: TripService = Depends(get_trip_service),
):
    """Get trips for the current user, optionally filtered by group."""
    trips = await trip_service.get_trips(current_user.id, group_id)
    return trips


@router.post("", response_model=Trip)
async def create_trip(
    trip_data: CreateTrip,
    current_user: User = Depends(get_current_user),
    trip_service: TripService = Depends(get_trip_service),
):
    """Create a new trip using frontend-calculated values."""
    result = await trip_service.create_trip(trip_data, current_user.id)
    return result


@router.post("/{trip_id}/settle", status_code=204)
async def settle_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    trip_service: TripService = Depends(get_trip_service),
):
    """Mark trip as settled by the creator."""
    await trip_service.settle_trip(trip_id, current_user.id)
