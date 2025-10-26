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

export interface TripDetails {
  id: number;
  group_id: number;
  user_id: number;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  name: string;
  description?: string;
  stops: Stop[];
  total_distance: number;
  cost_per_distance: number;
  total_cost: number;
  created_at: string;
  settled_at: string | null;
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

  async getTrips(groupId?: number): Promise<TripDetails[]> {
    try {
      const url = new URL(getApiUrl(API_ROUTES.trips.list));
      if (groupId) {
        url.searchParams.append('group_id', groupId.toString());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch trips: ${response.status}`);
      }

      const trips = await response.json();
      return trips;
    } catch (error) {
      console.error('Trip fetching failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch trips');
    }
  }

  async settleTrip(tripId: number): Promise<void> {
    try {
      const response = await fetch(getApiUrl(`${API_ROUTES.trips.settle}/${tripId}/settle`), {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to settle trip: ${response.status}`);
      }
    } catch (error) {
      console.error('Trip settlement failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to settle trip');
    }
  }
}

export const tripService = new TripService();