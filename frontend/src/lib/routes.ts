/**
 * API routes configuration for FareShare frontend
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export const API_ROUTES = {
  users: {
    create: '/users',  // PUT /users - Create account
    login: '/users',   // POST /users - Login
    me: '/users/me',   // GET /users/me - Get profile
  },
  groups: {
    list: '/groups',   // GET /groups - Get user's groups
  },
} as const;

/**
 * Get full URL for an API route
 */
export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}