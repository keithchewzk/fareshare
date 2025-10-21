/**
 * Group service for handling group-related API calls
 */

import { API_ROUTES, getApiUrl } from '../lib/routes';

export interface Group {
  id: number;
  name: string;
  description?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  cost_per_distance: number;
  distance_unit: 'km' | 'mi';
}

class GroupService {
  /**
   * Get user's groups
   */
  async getGroups(): Promise<Group[]> {
    const token = localStorage.getItem('fareshare_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(getApiUrl(API_ROUTES.groups.list), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Failed to fetch groups';
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Create a new group
   */
  async createGroup(groupData: CreateGroupRequest): Promise<Group> {
    const token = localStorage.getItem('fareshare_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(getApiUrl(API_ROUTES.groups.create), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(groupData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Failed to create group';
      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export const groupService = new GroupService();