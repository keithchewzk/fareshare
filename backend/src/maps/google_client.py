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

    async def calculate_route_distance(self, place_ids: List[str]) -> Dict[str, Any]:
        """
        Calculate total distance for a route using Google Routes Distance Matrix API v2

        Args:
            place_ids: Ordered list of Google Place IDs for the route

        Returns:
            Raw response from Google Routes Distance Matrix API v2

        Raises:
            HTTPException: If API call fails
        """
        if len(place_ids) < 2:
            raise HTTPException(
                status_code=400, detail="Minimum 2 place IDs required for distance calculation"
            )

        url = f"{self.routes_base_url}/distanceMatrix/v2:computeRouteMatrix"

        # For route calculation, we need to create origins and destinations
        # For a simple route, we'll calculate distance from each point to the next
        origins = []
        destinations = []

        # Create origin-destination pairs for sequential route calculation
        for i in range(len(place_ids) - 1):
            origins.append({
                "waypoint": {
                    "placeId": place_ids[i]
                },
                "routeModifiers": {"avoid_ferries": True}
            })
            destinations.append({
                "waypoint": {
                    "placeId": place_ids[i + 1]
                }
            })

        request_body = {
            "origins": origins,
            "destinations": destinations,
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE"
        }

        # Headers for Routes API v2 - only request distance
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "originIndex,destinationIndex,distanceMeters,status",
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
