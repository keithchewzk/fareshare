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
        try:
            # Call Google Routes Distance Matrix API
            google_response = await self.google_client.calculate_route_distance(place_ids)

            # Transform Google response to our format
            total_distance = self._calculate_total_distance_from_matrix(google_response)

            return DistanceCalculation(
                total_distance=total_distance,
                distance_unit="km",
                status="OK"
            )

        except Exception as e:
            return DistanceCalculation(
                total_distance=0.0,
                distance_unit="km",
                status=f"error: {str(e)}"
            )

    def _calculate_total_distance_from_matrix(self, google_response: List[Dict[str, Any]]) -> float:
        """
        Calculate total distance from Google Routes Distance Matrix response

        Args:
            google_response: Raw response from Google Routes Distance Matrix API v2
                            Returns a list of route elements with structure:
                            [
                              {
                                "originIndex": 0,
                                "destinationIndex": 0,
                                "status": "OK",
                                "distanceMeters": 1234
                              }
                            ]

        Returns:
            Total distance in kilometers
        """
        total_distance_meters = 0.0

        # Debug: Log each element to see what we're getting
        print(f"Processing {len(google_response)} distance matrix elements:")

        # Google Routes Distance Matrix API v2 returns a list directly
        for i, element in enumerate(google_response):
            if isinstance(element, dict):
                print(f"Full element {i}: {element}")

                status = element.get("status", "")
                distance_meters = element.get("distanceMeters", 0)
                origin_index = element.get("originIndex", "?")
                dest_index = element.get("destinationIndex", "?")

                print(f"Element {i}: origin={origin_index}, dest={dest_index}, status={status}, distance={distance_meters}m")

                # Check if status is a dict or string, and handle accordingly
                should_include = False

                if isinstance(status, dict):
                    # Status might be a nested object, let's check its structure
                    print(f"Status is dict: {status}")
                    # Look for a status code or message within the status object
                    status_code = status.get("code", status.get("status", ""))

                    # Empty dict {} might mean success, or check for specific success codes
                    if len(status) == 0:  # Empty status dict likely means success
                        should_include = True
                        print(f"  -> Empty status dict, treating as success")
                    elif status_code == "OK" or status_code == 0:  # 0 often means success
                        should_include = True
                        print(f"  -> Success with status code: {status_code}")
                    else:
                        print(f"  -> Skipping element with status code: {status_code}")

                elif status == "OK" or status == "":  # Empty string might also mean success
                    should_include = True
                    print(f"  -> Success with status: '{status}'")
                else:
                    print(f"  -> Skipping element with status: {status}")

                if should_include:
                    total_distance_meters += distance_meters
                    print(f"  -> Added {distance_meters}m to total")

        print(f"Total distance: {total_distance_meters}m = {total_distance_meters/1000.0}km")

        # Convert meters to kilometers
        total_distance_km = total_distance_meters / 1000.0

        return total_distance_km
