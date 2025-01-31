import { IconName } from './icon-name';
import { NotificationType } from './notification-type';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  icon?: IconName | null;
  title: string;
  description?: string | null;
  addedAt: number;
  customData?: any;
}
