"""
Maps service - Business logic layer
"""

from typing import Any, Dict, List, Optional

from src.maps.google_client import GoogleMapsClient
from src.maps.schemas import AddressSuggestion, AddressSuggestions, DistanceCalculation


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
            place_id = place.get("id", "unknown_place_id")

            display_name = place.get("displayName", {})
            display_name_text = display_name.get("text", "Unknown Address Name")

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
        try:
            google_response = await self.google_client.calculate_route_distance(
                place_ids
            )

            total_distance = self._calculate_total_distance_from_matrix(google_response)

            return DistanceCalculation(
                total_distance=total_distance, distance_unit="km", status="OK"
            )

        except Exception as e:
            return DistanceCalculation(
                total_distance=0.0, distance_unit="km", status=f"error: {str(e)}"
            )

    def _calculate_total_distance_from_matrix(
        self, google_response: List[Dict[str, Any]]
    ) -> float:
        """
        Calculate total distance from Google Routes Distance Matrix response

        Args:
            google_response: Raw response from Google Routes Distance Matrix API v2
                            Returns a list of route elements with structure:
                            [
                              {
                                "originIndex": 0,
                                "destinationIndex": 0,
                                "status": {},
                                "distanceMeters": 1234,
                                "condition": "ROUTE_EXISTS"
                              }
                            ]

        Returns:
            Total distance in kilometers
        """
        total_distance_meters = 0.0

        for element in google_response:
            condition = element.get("condition")
            distance_meters = element.get("distanceMeters", 0)

            if condition == "ROUTE_EXISTS":
                total_distance_meters += distance_meters

        return total_distance_meters / 1000.0
