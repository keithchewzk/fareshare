/**
 * Maps service for handling Google Maps API calls
 */

import { API_ROUTES, getApiUrl } from '../lib/routes';

export interface AddressSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export interface AddressAutocompleteResponse {
  suggestions: AddressSuggestion[];
  status: string;
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
}

export const mapsService = new MapsService();