"""
Maps dependencies - Dependency injection for Maps domain
"""

from fastapi import Depends
from src.maps.google_client import GoogleMapsClient
from src.maps.service import MapsService
from src.settings import Settings, get_settings


def get_google_maps_client(
    settings: Settings = Depends(get_settings),
) -> GoogleMapsClient:
    """
    Create and return GoogleMapsClient instance

    Args:
        settings: Application settings with Google Maps API key

    Returns:
        GoogleMapsClient instance
    """
    return GoogleMapsClient(
        api_key=settings.google_maps_api_key,
        region_code=settings.google_maps_region_code,
    )


def get_maps_service(
    google_client: GoogleMapsClient = Depends(get_google_maps_client),
) -> MapsService:
    """
    Create and return MapsService instance with injected dependencies

    Args:
        google_client: GoogleMapsClient instance

    Returns:
        MapsService instance
    """
    return MapsService(google_client=google_client)
