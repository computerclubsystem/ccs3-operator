import { NotificationMessage } from '../index-declarations';
import { DeviceStatus } from '../index-entities';

export interface DeviceStatusesNotificationMessageBody {
    deviceStatuses: DeviceStatus[];
}

export type DeviceStatusesNotificationMessage = NotificationMessage<DeviceStatusesNotificationMessageBody>;
