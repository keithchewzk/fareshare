/**
 * Group service for handling group-related API calls
 */

import { API_ROUTES, getApiUrl } from '../lib/routes';

export interface Group {
  id: number;
  name: string;
  description?: string;
  invite_code: string;
  cost_per_distance: number;
  distance_unit: 'km' | 'mi';
  created_at: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  cost_per_distance: number;
  distance_unit: 'km' | 'mi';
}

export interface JoinGroupRequest {
  invite_code: string;
}

export interface Membership {
  role: 'owner' | 'member';
  joined_at: string;
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

  /**
   * Get a single group by ID
   */
  async getGroup(groupId: string): Promise<Group> {
    const token = localStorage.getItem('fareshare_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(getApiUrl(`${API_ROUTES.groups.detail}/${groupId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Failed to fetch group';
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Delete a group (owners only)
   */
  async deleteGroup(groupId: string): Promise<void> {
    const token = localStorage.getItem('fareshare_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(getApiUrl(`${API_ROUTES.groups.delete}/${groupId}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Failed to delete group';
      throw new Error(errorMessage);
    }

    // DELETE requests typically return no content (204)
    return;
  }

  /**
   * Join a group using an invite code
   */
  async joinGroup(joinData: JoinGroupRequest): Promise<Group> {
    const token = localStorage.getItem('fareshare_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(getApiUrl(API_ROUTES.groups.join), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(joinData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Failed to join group';
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Get user's membership information for a group
   */
  async getUserMembership(groupId: string): Promise<Membership> {
    const token = localStorage.getItem('fareshare_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(getApiUrl(`${API_ROUTES.groups.membership}/${groupId}/membership`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Failed to get membership information';
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Leave a group (members only)
   */
  async leaveGroup(groupId: string): Promise<void> {
    const token = localStorage.getItem('fareshare_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(getApiUrl(`${API_ROUTES.groups.leave}/${groupId}/leave`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Failed to leave group';
      throw new Error(errorMessage);
    }

    // POST requests typically return no content (204)
    return;
  }
}

export const groupService = new GroupService();