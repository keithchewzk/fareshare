"""
Maps domain schemas - Pydantic models for requests and responses
"""

from typing import List

from pydantic import BaseModel


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


class AddressAutocompleteResponse(BaseModel):
    """
    Response containing list of address suggestions
    """

    suggestions: List[AddressSuggestion]
    status: str
