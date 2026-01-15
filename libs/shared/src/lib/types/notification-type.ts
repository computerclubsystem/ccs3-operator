export const NotificationType = {
  success: 'success',
  info: 'info',
  warn: 'warn',
  error: 'error',
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];
