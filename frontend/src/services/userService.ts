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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
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

  /**
   * Login user and get JWT token
   */
  async login(credentials: LoginRequest): Promise<{ user: CreateUserResponse; token: string }> {
    // Step 1: Authenticate and get token
    const loginResponse = await fetch(getApiUrl(API_ROUTES.auth.login), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json().catch(() => ({}));
      if (loginResponse.status === 401) {
        throw new Error('Invalid email or password');
      }
      const errorMessage = errorData.detail || 'Login failed';
      throw new Error(errorMessage);
    }

    const { access_token } = await loginResponse.json() as LoginResponse;

    // Step 2: Get user profile using the token
    const profileResponse = await fetch(getApiUrl(API_ROUTES.auth.me), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to get user profile');
    }

    const userProfile = await profileResponse.json() as UserProfile;

    return {
      user: userProfile,
      token: access_token,
    };
  }
}

export const userService = new UserService();