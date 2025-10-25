"""
Maps router - API endpoints for Google Maps integration
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from src.maps.dependencies import get_maps_service
from src.maps.schemas import AddressSuggestions, CalculateDistance, DistanceCalculation
from src.maps.service import MapsService

# Create router instance
router = APIRouter(prefix="/maps", tags=["Maps"])


@router.get(
    "/autocomplete",
    response_model=AddressSuggestions,
    summary="Get address suggestions",
    description="Get autocomplete suggestions for partial addresses using Google Places API",
)
async def autocomplete_address(
    query: str = Query(
        ...,
        description="Partial address to search for",
        min_length=2,
        max_length=100,
        example="123 Main St",
    ),
    session_token: Optional[str] = Query(
        None, description="Session token for billing optimization", max_length=100
    ),
    maps_service: MapsService = Depends(get_maps_service),
) -> AddressSuggestions:
    """
    Get address autocomplete suggestions

    This endpoint provides real-time address suggestions as users type,
    powered by Google Places API. Suggestions are filtered to addresses only.

    Args:
        query: Partial address text to search for (minimum 2 characters)
        session_token: Optional session token for Google billing optimization
        maps_service: Injected MapsService instance

    Returns:
        AddressSuggestions with list of address suggestions

    Raises:
        HTTPException: If Google Maps API call fails
    """
    return await maps_service.get_address_suggestions(
        query=query, session_token=session_token
    )


@router.post(
    "/calculate-distance",
    response_model=DistanceCalculation,
    summary="Calculate distance between waypoints",
    description="Calculate total distance for a route using Google Place IDs",
)
async def calculate_distance(
    request: CalculateDistance,
    maps_service: MapsService = Depends(get_maps_service),
) -> DistanceCalculation:
    """
    Calculate total distance for a route using ordered list of Google Place IDs

    This endpoint takes an ordered list of Google Place IDs and calculates
    the total distance of the route using Google Maps Distance Matrix API.

    Args:
        request: CalculateDistance with ordered list of place IDs
        maps_service: Injected MapsService instance

    Returns:
        DistanceCalculation with total distance and status

    Raises:
        HTTPException: If Google Maps API call fails or place IDs are invalid
    """
    return await maps_service.calculate_route_distance(place_ids=request.place_ids)
