import { NotificationMessage } from './declarations/message';
import { DeviceStatus } from './entities/device-status';

export interface DeviceStatusesNotificationMessageBody {
    deviceStatuses: DeviceStatus[];
}

export interface DeviceStatusesNotificationMessage extends NotificationMessage<DeviceStatusesNotificationMessageBody> {
}
