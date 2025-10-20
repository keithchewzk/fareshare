from fastapi import Depends
from sqlalchemy.orm import Session
from src.trips.repository import TripRepository
from src.trips.service import TripService
from src.models.base import get_db


def get_trip_service(db: Session = Depends(get_db)) -> TripService:
    """Dependency to get TripService with injected repository"""
    trip_repository = TripRepository(db)
    return TripService(trip_repository)