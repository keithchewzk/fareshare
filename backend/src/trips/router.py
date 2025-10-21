from fastapi import APIRouter, Depends
from src.trips.dependencies import get_trip_service
from src.trips.schemas import CreateTrip
from src.trips.service import TripService
from src.users.dependencies import get_current_user
from src.users.models import User

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("/")
async def create_trip(
    trip_data: CreateTrip,
    current_user: User = Depends(get_current_user),
    trip_service: TripService = Depends(get_trip_service),
):
    """Create a new trip with mocked distance."""
    result = await trip_service.create_trip(trip_data, current_user.id)
    return result
