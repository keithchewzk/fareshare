"""
Google Maps API client wrapper
"""

from typing import Any, Dict, Optional

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
        self.base_url = "https://places.googleapis.com/v1"

    async def autocomplete_address(
        self, query: str, session_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get address autocomplete suggestions from Google Places API v1

        Args:
            query: Partial address to search for
            session_token: Optional session token for billing optimization

        Returns:
            Raw response from Google Places Autocomplete API v1

        Raises:
            HTTPException: If API call fails
        """
        url = f"{self.base_url}/places:autocomplete"

        # Request body for Places API v1
        request_body = {
            "input": query,
            "includedPrimaryTypes": [
                "street_address",
                "premise",
                "subpremise",
            ],  # Restrict to addresses
            "includedRegionCodes": [self.region_code],  # Restrict to specific country
            "regionCode": self.region_code,  # Format addresses for this region
        }

        if session_token:
            request_body["sessionToken"] = session_token

        # Headers for Places API v1
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text",
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
