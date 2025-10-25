from decimal import Decimal
from typing import Any, Dict, List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from src.groups.models import Group, GroupMembership
from src.trips.models import Trip


class TripRepository:
    """Repository layer for trip database operations."""

    def __init__(self, db: Session):
        self.db = db

    def create_trip(
        self,
        group_id: int,
        created_by: int,
        name: str,
        description: str,
        stops: List[Dict[str, Any]],
        total_distance: Decimal,
    ) -> Trip:
        """
        Create a new trip in the database.
        Atomically retrieves group and creates trip.

        Returns:
            Created trip
        """
        # Get group and validate it exists (atomic with trip creation)
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
            )

        # Create trip (distance is always in km)
        trip = Trip(
            group_id=group_id,
            created_by=created_by,
            name=name,
            description=description,
            stops=stops,
            total_distance=total_distance,
        )

        self.db.add(trip)
        self.db.commit()
        self.db.refresh(trip)

        return trip

    def is_user_in_group(self, user_id: int, group_id: int) -> bool:
        """Check if user is a member of the specified group."""
        membership = (
            self.db.query(GroupMembership)
            .filter(
                GroupMembership.user_id == user_id,
                GroupMembership.group_id == group_id
            )
            .first()
        )
        return membership is not None
