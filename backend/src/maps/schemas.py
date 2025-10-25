"""
Maps domain schemas - Pydantic models for requests and responses
"""

from typing import List

from pydantic import BaseModel, Field


class Location(BaseModel):
    """
    Geographic location with latitude and longitude coordinates
    """

    latitude: float
    longitude: float


class AddressSuggestion(BaseModel):
    """
    Single address suggestion from Google Places Text Search API
    """

    id: str
    display_name: str  # Full formatted address from Google Places
    location: Location  # Geographic coordinates


class AddressSuggestions(BaseModel):
    """
    Address suggestions from autocomplete search
    """

    suggestions: List[AddressSuggestion]
    status: str


class CalculateDistance(BaseModel):
    """
    Request for calculating distance between multiple waypoints using place IDs
    """

    place_ids: List[str] = Field(
        ...,
        min_length=2,
        description="Ordered list of Google Place IDs (minimum 2 required)",
        example=["ChIJ1c-DTZEa2jERUrJ1w-MTl1Q", "ChIJCUXxRCka2jERnD3m0_mrUk8"],
    )


class DistanceCalculation(BaseModel):
    """
    Calculated distance information for a route
    """

    total_distance: float  # Total distance in kilometers
    distance_unit: str = "km"  # Distance unit
    status: str
