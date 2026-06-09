/** Client-side route paths — use everywhere (Routes, Navigate, Link). */
export const FE_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
} as const;

/** Default route when an unknown path is hit or auth is required. */
export const FE_DEFAULT_ROUTE = FE_ROUTES.LOGIN;
