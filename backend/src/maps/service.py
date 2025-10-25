"""
Maps service - Business logic layer
"""

from typing import Any, Dict, List, Optional

from src.maps.google_client import GoogleMapsClient
from src.maps.schemas import AddressAutocompleteResponse, AddressSuggestion, Location


class MapsService:
    """
    Service layer for Maps domain business logic
    """

    def __init__(self, google_client: GoogleMapsClient):
        """
        Initialize Maps service with Google Maps client
        """
        self.google_client = google_client

    async def get_address_suggestions(
        self, query: str, session_token: Optional[str] = None
    ) -> AddressAutocompleteResponse:
        """
        Get address autocomplete suggestions and transform to our schema format

        Args:
            query: Partial address to search for
            session_token: Optional session token for billing optimization

        Returns:
            AddressAutocompleteResponse with transformed suggestions
        """
        # Get raw response from Google Places API v1
        google_response = await self.google_client.autocomplete_address(
            query=query, session_token=session_token
        )

        # Transform Google response to our schema format
        suggestions = self._transform_google_suggestions(google_response)

        return AddressAutocompleteResponse(suggestions=suggestions, status="OK")

    def _transform_google_suggestions(
        self, google_response: Dict[str, Any]
    ) -> List[AddressSuggestion]:
        """
        Transform Google Places Text Search API v1 response to our AddressSuggestion format

        Args:
            google_response: Raw response from Google Places Text Search API v1

        Returns:
            List of AddressSuggestion objects
        """
        suggestions = []

        # Get places array from Google response
        google_places = google_response.get("places", [])

        for place in google_places:
            # Extract place ID from id field
            place_id = place.get("id", "")

            # Extract display name
            display_name = place.get("displayName", {})
            display_name_text = display_name.get("text", "")

            # Extract location coordinates
            location_data = place.get("location", {})
            latitude = location_data.get("latitude", 0.0)
            longitude = location_data.get("longitude", 0.0)

            # Create Location object
            location = Location(latitude=latitude, longitude=longitude)

            # Create our AddressSuggestion object
            address_suggestion = AddressSuggestion(
                id=place_id,
                display_name=display_name_text,
                location=location,
            )

            suggestions.append(address_suggestion)

        return suggestions
