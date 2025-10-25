/**
 * API routes configuration for FareShare frontend
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export const API_ROUTES = {
  users: {
    create: '/users',  // POST /users - Create account
    login: '/users/login',   // POST /users/login - Login
    me: '/users/me',   // GET /users/me - Get profile
  },
  groups: {
    list: '/groups',   // GET /groups - Get user's groups
    create: '/groups', // POST /groups - Create new group
    detail: '/groups', // GET /groups/:id - Get single group
    delete: '/groups', // DELETE /groups/:id - Delete group
    join: '/groups/join', // POST /groups/join - Join group via invite code
    membership: '/groups', // GET /groups/:id/membership - Get user's membership role
    leave: '/groups', // POST /groups/:id/leave - Leave group
  },
  maps: {
    autocomplete: '/maps/autocomplete', // GET /maps/autocomplete - Get address suggestions
  },
} as const;

/**
 * Get full URL for an API route
 */
export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}