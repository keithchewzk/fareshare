/**
 * Trip service for handling trip-related API calls
 */

import { API_ROUTES, getApiUrl } from '../lib/routes';

export interface Stop {
  place_id: string;
  display_name: string;
}

export interface CreateTripRequest {
  group_id: number;
  name: string;
  description?: string;
  stops: Stop[];
  total_distance: number;
  cost_per_distance: number;
  total_cost: number;
}

export interface Trip {
  id: number;
  group_id: number;
  user_id: number;
  name: string;
  description?: string;
  stops: Stop[];
  total_distance: number;
  cost_per_distance: number;
  total_cost: number;
  created_at: string;
}

class TripService {
  private getAuthHeaders() {
    const token = localStorage.getItem('fareshare_token');
    if (!token) {
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createTrip(tripData: CreateTripRequest): Promise<Trip> {
    try {
      const response = await fetch(getApiUrl(API_ROUTES.trips.create), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to create trip: ${response.status}`);
      }

      const trip = await response.json();
      return trip;
    } catch (error) {
      console.error('Trip creation failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create trip');
    }
  }
}

export const tripService = new TripService();