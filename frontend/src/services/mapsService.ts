/**
 * Maps service for handling Google Maps API calls
 */

import { API_ROUTES, getApiUrl } from '../lib/routes';

export interface AddressSuggestion {
  place_id: string;
  display_name: string;
}

export interface AddressAutocompleteResponse {
  suggestions: AddressSuggestion[];
}

export interface CalculateDistanceRequest {
  place_ids: string[];
}

export interface DistanceCalculationResponse {
  total_distance: number; // Total distance in kilometers
}

class MapsService {
  /**
   * Get address autocomplete suggestions
   */
  async getAddressSuggestions(
    query: string,
    sessionToken?: string
  ): Promise<AddressSuggestion[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const url = new URL(getApiUrl(API_ROUTES.maps.autocomplete));
      url.searchParams.append('query', query);
      if (sessionToken) {
        url.searchParams.append('session_token', sessionToken);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Failed to fetch address suggestions';
        throw new Error(errorMessage);
      }

      const data: AddressAutocompleteResponse = await response.json();
      return data.suggestions;
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      return [];
    }
  }

  /**
   * Calculate distance between waypoints using place IDs
   */
  async calculateDistance(placeIds: string[]): Promise<number> {
    if (!placeIds || placeIds.length < 2) {
      throw new Error('At least 2 place IDs are required for distance calculation');
    }

    try {
      const requestBody: CalculateDistanceRequest = { place_ids: placeIds };

      const response = await fetch(getApiUrl(API_ROUTES.maps.calculateDistance), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Failed to calculate distance';
        throw new Error(errorMessage);
      }

      const data: DistanceCalculationResponse = await response.json();
      return data.total_distance;
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }
}

export const mapsService = new MapsService();