"""
Maps service - Business logic layer
"""

from typing import Any, Dict, List, Optional

from src.maps.google_client import GoogleMapsClient
from src.maps.schemas import AddressAutocompleteResponse, AddressSuggestion


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
        Transform Google Places API v1 response to our AddressSuggestion format

        Args:
            google_response: Raw response from Google Places API v1

        Returns:
            List of AddressSuggestion objects
        """
        suggestions = []

        # Get suggestions array from Google response
        google_suggestions = google_response.get("suggestions", [])

        for suggestion in google_suggestions:
            # Only process placePredictions (ignore queryPredictions)
            place_prediction = suggestion.get("placePrediction")
            if not place_prediction:
                continue

            # Extract place ID
            place_id = place_prediction.get("placeId", "")

            # Extract text information
            text_info = place_prediction.get("text", {})
            full_text = text_info.get("text", "")

            # For Google Places API v1, we need to parse main_text and secondary_text
            # from the full address text since they're not separate fields
            main_text, secondary_text = self._parse_address_parts(full_text)

            # Create our AddressSuggestion object
            address_suggestion = AddressSuggestion(
                place_id=place_id,
                description=full_text,
                main_text=main_text,
                secondary_text=secondary_text,
            )

            suggestions.append(address_suggestion)

        return suggestions

    def _parse_address_parts(self, full_address: str) -> tuple[str, str]:
        """
        Parse full address into main text and secondary text parts

        Args:
            full_address: Full formatted address string

        Returns:
            Tuple of (main_text, secondary_text)
        """
        if not full_address:
            return "", ""

        # Split address by commas to separate main part from city/state/country
        parts = [part.strip() for part in full_address.split(",")]

        if len(parts) <= 1:
            # No comma separation, return full text as main
            return full_address, ""

        # First part is typically the main address (street number + name)
        main_text = parts[0]

        # Remaining parts are secondary (city, state, country)
        secondary_text = ", ".join(parts[1:])

        return main_text, secondary_text
