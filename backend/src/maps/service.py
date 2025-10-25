"""
Maps service - Business logic layer
"""

from typing import Any, Dict, List, Optional

from src.maps.google_client import GoogleMapsClient
from src.maps.schemas import (
    AddressSuggestion,
    AddressSuggestions,
    DistanceCalculation,
)


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
    ) -> AddressSuggestions:
        """
        Get address autocomplete suggestions and transform to our schema format

        Args:
            query: Partial address to search for
            session_token: Optional session token for billing optimization

        Returns:
            AddressSuggestions with transformed suggestions
        """
        # Get raw response from Google Places API v1
        google_response = await self.google_client.autocomplete_address(
            query=query, session_token=session_token
        )

        # Transform Google response to our schema format
        suggestions = self._transform_google_suggestions(google_response)

        return AddressSuggestions(suggestions=suggestions, status="OK")

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

            # Create our AddressSuggestion object
            address_suggestion = AddressSuggestion(
                place_id=place_id,
                display_name=display_name_text,
            )

            suggestions.append(address_suggestion)

        return suggestions

    async def calculate_route_distance(
        self, place_ids: List[str]
    ) -> DistanceCalculation:
        """
        Calculate total distance for a route using Google Place IDs

        Args:
            place_ids: Ordered list of Google Place IDs for the route

        Returns:
            DistanceCalculation with total distance and status
        """
        # TODO: Implement Google Maps Distance Matrix API integration
        # For now, return a placeholder response

        # Placeholder calculation - will implement with Google Maps API
        placeholder_distance = len(place_ids) * 5.0  # 5km per waypoint as placeholder

        return DistanceCalculation(
            total_distance=placeholder_distance, distance_unit="km", status="OK"
        )
