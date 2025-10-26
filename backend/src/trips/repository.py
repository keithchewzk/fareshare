from decimal import Decimal
from typing import Any, Dict, List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from src.groups.models import Group, GroupMembership
from src.trips.models import Trip
from src.users.models import User


class TripRepository:
    """Repository layer for trip database operations."""

    def __init__(self, db: Session):
        self.db = db

    def create_trip(
        self,
        group_id: int,
        user_id: int,
        name: str,
        description: str,
        stops: List[Dict[str, Any]],
        total_distance: float,
        cost_per_distance: Decimal,
        total_cost: Decimal,
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
            user_id=user_id,
            name=name,
            description=description,
            stops=stops,
            total_distance=total_distance,
            cost_per_distance=cost_per_distance,
            total_cost=total_cost,
        )

        self.db.add(trip)
        self.db.commit()
        self.db.refresh(trip)

        return trip

    def get_trips(self, user_id: int, group_id: int = None) -> List[tuple]:
        """
        Get trips with user data for a user, optionally filtered by group.
        Only returns trips from groups the user is a member of.

        Returns:
            List of tuples: (Trip, User) containing trip and user data
        """
        query = (
            self.db.query(Trip, User)
            .join(User, Trip.user_id == User.id)
            .join(GroupMembership, Trip.group_id == GroupMembership.group_id)
            .filter(GroupMembership.user_id == user_id)
        )

        if group_id is not None:
            query = query.filter(Trip.group_id == group_id)

        trip_user_pairs = query.order_by(Trip.created_at.desc()).all()
        return trip_user_pairs

    def is_user_in_group(self, user_id: int, group_id: int) -> bool:
        """Check if user is a member of the specified group."""
        membership = (
            self.db.query(GroupMembership)
            .filter(
                GroupMembership.user_id == user_id, GroupMembership.group_id == group_id
            )
            .first()
        )
        return membership is not None

    def settle_trip(self, trip_id: int, user_id: int) -> None:
        """
        Mark trip as settled with current timestamp.
        Only trip creator can settle their own trip.

        Args:
            trip_id: ID of the trip to settle
            user_id: ID of the user attempting to settle (must be trip creator)

        Returns:
            Updated trip with settlement timestamp

        Raises:
            HTTPException: If trip not found, not authorized, or already settled
        """
        trip = (
            self.db.query(Trip)
            .filter(Trip.id == trip_id, Trip.user_id == user_id)
            .first()
        )

        if not trip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trip not found or not authorized to settle",
            )

        if trip.settled_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trip already settled",
            )

        trip.settled_at = func.now()
        self.db.commit()
        return
