"""
Google Maps API client wrapper
"""

from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException


class GoogleMapsClient:
    """
    Client wrapper for Google Maps APIs
    """

    def __init__(self, api_key: str, region_code: str = "SG"):
        """
        Initialize Google Maps client with API key and region settings

        Args:
            api_key: Google Maps API key
            region_code: ISO 3166-1 alpha-2 country code for region bias
        """
        self.api_key = api_key
        self.region_code = region_code
        self.places_base_url = "https://places.googleapis.com/v1"
        self.routes_base_url = "https://routes.googleapis.com"

    async def autocomplete_address(
        self, query: str, session_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get address suggestions from Google Places Text Search API v1

        Args:
            query: Address text to search for
            session_token: Optional session token for billing optimization

        Returns:
            Raw response from Google Places Text Search API v1

        Raises:
            HTTPException: If API call fails
        """
        url = f"{self.places_base_url}/places:searchText"

        # Request body for Places Text Search API v1
        request_body = {
            "textQuery": query,
            "regionCode": self.region_code,  # Bias results to this region
        }

        if session_token:
            request_body["sessionToken"] = session_token

        # Headers for Places API v1 - only request id and displayName
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.id,places.displayName",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url, json=request_body, headers=headers, timeout=10.0
                )
                response.raise_for_status()

                data = response.json()

                return data

        except httpx.HTTPError as e:
            if hasattr(e, "response") and e.response is not None:
                try:
                    error_detail = e.response.json()
                    raise HTTPException(
                        status_code=500,
                        detail=f"Google Places API error: {error_detail}",
                    )
                except:
                    pass

            raise HTTPException(
                status_code=500, detail=f"Failed to call Google Places API: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error calling Google Places API: {str(e)}",
            )

    async def calculate_route_distance(self, place_ids: List[str]) -> float:
        """
        Calculate total distance for a multi-stop route using Google Routes API v2 (computeRoutes).

        Args:
            place_ids: Ordered list of Google Place IDs for the route (Start, Stop1, ..., End).

        Returns:
            Extracted distance metres response from Google Routes API v2, converted to km.

        Raises:
            HTTPException: If API call fails or minimum stops are not met.
        """
        if len(place_ids) < 2:
            raise HTTPException(
                status_code=400, detail="Minimum 2 place IDs required for distance calculation"
            )

        url = f"{self.routes_base_url}/directions/v2:computeRoutes"

        origin_id = place_ids[0]
        destination_id = place_ids[-1]
        intermediate_ids = place_ids[1:-1]


        request_body = {
            "origin": {
                "placeId": origin_id
            },
            "destination": {
                "placeId": destination_id
            },
            "intermediates": [{"placeId": id} for id in intermediate_ids],
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE",
            "languageCode": "en-US",
            "units": "METRIC"
        }

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "routes.distanceMeters",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url, json=request_body, headers=headers, timeout=10.0
                )
                response.raise_for_status()

                data = response.json() # e.g. {'routes': [{'distanceMeters': 59767}]}
                distance_metres = data["routes"][0]["distanceMeters"]
                distance_km = distance_metres / 1000
                return distance_km

        except httpx.HTTPError as e:
            if hasattr(e, "response") and e.response is not None:
                try:
                    error_detail = e.response.json()
                    raise HTTPException(
                        status_code=500,
                        detail=f"Google Routes API error: {error_detail}",
                    )
                except:
                    pass

            raise HTTPException(
                status_code=500, detail=f"Failed to call Google Routes API: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error calling Google Routes API: {str(e)}",
            )