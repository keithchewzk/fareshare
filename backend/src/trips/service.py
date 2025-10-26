from decimal import Decimal
from typing import Dict, List

from fastapi import HTTPException, status
from src.trips.repository import TripRepository
from src.trips.schemas import CreateTrip, Stop, Trip, TripDetails


class TripService:
    """Minimal service layer for trip operations."""

    def __init__(self, trip_repository: TripRepository):
        self.trip_repository = trip_repository

    @staticmethod
    def _serialize_stops(stops: List[Stop]) -> List[Dict[str, str]]:
        """Convert Stop objects to dict format for JSONB storage."""
        return [stop.model_dump() for stop in stops]

    @staticmethod
    def _deserialize_stops(stop_dicts: List[Dict[str, str]]) -> List[Stop]:
        """Convert dict data back to Stop objects."""
        return [Stop(**stop_dict) for stop_dict in stop_dicts]

    async def create_trip(self, trip_data: CreateTrip, user_id: int):
        """
        Create a new trip using frontend-calculated values.

        - Validate user is member of the group
        - Use frontend-provided distance and cost values
        - Convert Stop objects to dict format for JSONB storage
        """
        self._validate_group_membership(trip_data.group_id, user_id)

        trip = self.trip_repository.create_trip(
            group_id=trip_data.group_id,
            user_id=user_id,
            name=trip_data.name,
            description=trip_data.description,
            stops=self._serialize_stops(trip_data.stops),
            total_distance=trip_data.total_distance,
            cost_per_distance=trip_data.cost_per_distance,
            total_cost=trip_data.total_cost,
        )

        return Trip(
            id=trip.id,
            group_id=trip.group_id,
            user_id=trip.user_id,
            name=trip.name,
            description=trip.description,
            stops=self._deserialize_stops(trip.stops),
            total_distance=trip.total_distance,
            cost_per_distance=trip.cost_per_distance,
            total_cost=trip.total_cost,
            created_at=trip.created_at,
        )

    async def get_trips(self, user_id: int, group_id: int = None) -> List[TripDetails]:
        """
        Get trips with user details for a user, optionally filtered by group.

        - Returns trips from groups the user is a member of
        - Includes user information (name, email) for each trip
        - Optional group_id filter for specific group trips
        - Results sorted by newest first
        """
        trip_user_pairs = self.trip_repository.get_trips(user_id, group_id)

        return [
            TripDetails(
                id=trip.id,
                group_id=trip.group_id,
                user_id=trip.user_id,
                user_first_name=user.first_name,
                user_last_name=user.last_name or "",
                user_email=user.email,
                name=trip.name,
                description=trip.description,
                stops=self._deserialize_stops(trip.stops),
                total_distance=trip.total_distance,
                cost_per_distance=trip.cost_per_distance,
                total_cost=trip.total_cost,
                created_at=trip.created_at,
            )
            for trip, user in trip_user_pairs
        ]

    def _validate_group_membership(self, group_id: int, user_id: int) -> None:
        """
        Validate that user is a member of the specified group.

        Raises:
            HTTPException: If user is not a member of the group
        """
        if not self.trip_repository.is_user_in_group(user_id, group_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be a member of this group to create trips",
            )
