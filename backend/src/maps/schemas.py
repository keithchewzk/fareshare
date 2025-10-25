"""
Maps domain schemas - Pydantic models for requests and responses
"""

from typing import List

from pydantic import BaseModel


class AddressSuggestion(BaseModel):
    """
    Single address suggestion from Google Places Autocomplete API
    """

    place_id: str
    description: str  # Full formatted address
    main_text: str  # Primary address part
    secondary_text: str  # Secondary info (city, state)


class AddressAutocompleteResponse(BaseModel):
    """
    Response containing list of address suggestions
    """

    suggestions: List[AddressSuggestion]
    status: str
