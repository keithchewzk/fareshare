from decimal import Decimal

from fastapi import HTTPException, status
from src.trips.repository import TripRepository
from src.trips.schemas import CreateTrip


class TripService:
    """Minimal service layer for trip operations."""

    def __init__(self, trip_repository: TripRepository):
        self.trip_repository = trip_repository

    async def create_trip(self, trip_data: CreateTrip, user_id: int):
        """
        Create a new trip with mocked distance.

        Step 1 implementation:
        - Validate user is member of the group
        - Mock total_distance = 50km
        - Repository handles group lookup and distance_unit inheritance atomically
        """
        # 1. Validate user is member of the group
        self._validate_group_membership(trip_data.group_id, user_id)

        # 2. Mock distance for now
        total_distance = Decimal("50.0")  # 50km mock

        # 3. Create trip in database (repository handles group lookup atomically)
        trip = self.trip_repository.create_trip(
            group_id=trip_data.group_id,
            created_by=user_id,
            name=trip_data.name,
            description=trip_data.description,
            stops=trip_data.stops,
            total_distance=total_distance,
        )

        return {
            "id": trip.id,
            "group_id": trip.group_id,
            "created_by": trip.created_by,
            "name": trip.name,
            "description": trip.description,
            "total_distance": float(trip.total_distance),
            "distance_unit": trip.distance_unit,
            "created_at": trip.created_at.isoformat(),
        }

    def _validate_group_membership(self, group_id: int, user_id: int) -> None:
        """
        Validate that user is a member of the specified group.

        Raises:
            HTTPException: If user is not a member of the group
        """
        if not self.trip_repository.is_user_in_group(user_id, group_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be a member of this group to create trips"
            )
