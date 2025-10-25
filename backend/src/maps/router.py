"""
Maps router - API endpoints for Google Maps integration
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from src.maps.dependencies import get_maps_service
from src.maps.schemas import AddressAutocompleteResponse
from src.maps.service import MapsService

# Create router instance
router = APIRouter(prefix="/maps", tags=["Maps"])


@router.get(
    "/autocomplete",
    response_model=AddressAutocompleteResponse,
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
) -> AddressAutocompleteResponse:
    """
    Get address autocomplete suggestions

    This endpoint provides real-time address suggestions as users type,
    powered by Google Places API. Suggestions are filtered to addresses only.

    Args:
        query: Partial address text to search for (minimum 2 characters)
        session_token: Optional session token for Google billing optimization
        maps_service: Injected MapsService instance

    Returns:
        AddressAutocompleteResponse with list of address suggestions

    Raises:
        HTTPException: If Google Maps API call fails
    """
    return await maps_service.get_address_suggestions(
        query=query, session_token=session_token
    )
