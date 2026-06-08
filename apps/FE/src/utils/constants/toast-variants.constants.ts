/** Toast variant keys shared by the toast UI and the use-error/use-success hooks. */
export const TOAST_VARIANTS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type ToastVariant =
  | 'default'
  | (typeof TOAST_VARIANTS)[keyof typeof TOAST_VARIANTS];
