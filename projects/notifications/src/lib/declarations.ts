import { IconName } from '@ccs3-operator/shared';

export enum NotificationType {
  success = 'success',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  icon?: IconName | null;
  title: string;
  description?: string | null;
  addedAt: number;
  customData?: any;
}

export interface NotificationComponentData {
  item: NotificationItem;
}
