/**
 * Group service for handling group-related API calls
 */

import { API_ROUTES, getApiUrl } from '../lib/routes';

export interface Group {
  id: number;
  name: string;
  description?: string;
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
}

export const groupService = new GroupService();