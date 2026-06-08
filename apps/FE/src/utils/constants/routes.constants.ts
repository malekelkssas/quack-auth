/** Client-side route paths — use everywhere (Routes, Navigate, Link). */
export const FE_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
} as const;

/** Default route when `/` or an unknown path is hit. */
export const FE_DEFAULT_ROUTE = FE_ROUTES.SIGNUP;

export type FeRoute = (typeof FE_ROUTES)[keyof typeof FE_ROUTES];
