/**
 * User service for handling user-related API calls
 */

import { API_ROUTES, getApiUrl } from '../lib/routes';

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
}

export interface CreateUserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name?: string;
}

class UserService {
  /**
   * Register a new user
   */
  async register(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await fetch(getApiUrl(API_ROUTES.users.create), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Registration failed';
      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export const userService = new UserService();